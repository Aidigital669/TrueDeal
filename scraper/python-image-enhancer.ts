import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface EnhancedImageResult {
  originalUrl: string;
  enhancedUrl: string;
  enhanced: boolean;
  cached?: boolean;
  width?: number;
  height?: number;
  sizeBytes?: number;
  error?: string;
}

export interface ImageEnhancerStats {
  total: number;
  enhanced: number;
  durationMs: number;
}

export interface ImageEnhancerResponse {
  success: boolean;
  results: EnhancedImageResult[];
  stats?: ImageEnhancerStats;
  error?: string;
}

/**
 * Resolves the Python executable path across platforms
 */
function resolvePythonBinary(): string {
  if (process.env.PYTHON_PATH && fs.existsSync(process.env.PYTHON_PATH)) {
    return process.env.PYTHON_PATH;
  }

  // Common Windows Python paths
  const windowsCandidates = [
    "C:\\Users\\ADMIN\\AppData\\Local\\Programs\\Python\\Python312\\python.exe",
    "C:\\Users\\ADMIN\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
    "C:\\Program Files\\Python312\\python.exe",
    "C:\\Program Files\\Python311\\python.exe"
  ];

  for (const candidate of windowsCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Fallback to PATH
  return process.platform === "win32" ? "python" : "python3";
}

/**
 * Invokes the Python image enhancer script with an array of image URLs
 */
export async function runPythonImageEnhancer(
  imageUrls: string[],
  options?: { minRes?: number; timeoutMs?: number }
): Promise<EnhancedImageResult[]> {
  const cleanUrls = imageUrls.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  if (cleanUrls.length === 0) {
    return [];
  }

  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, "src", "lib", "python-image-enhancer.py");

  if (!fs.existsSync(scriptPath)) {
    console.warn(`[Python Enhancer] Script not found at: ${scriptPath}`);
    return cleanUrls.map(u => ({ originalUrl: u, enhancedUrl: u, enhanced: false }));
  }

  const pythonBin = resolvePythonBinary();
  const minRes = options?.minRes || 1000;
  const timeoutMs = options?.timeoutMs || 45000; // 45 seconds max

  return new Promise((resolve) => {
    let resolved = false;

    const child = spawn(
      pythonBin,
      [
        scriptPath,
        "--root", projectRoot,
        "--min-res", minRes.toString()
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true
      }
    );

    let stdoutData = "";
    let stderrData = "";

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          child.kill("SIGKILL");
        } catch {}
        console.warn("[Python Enhancer] Process timed out after", timeoutMs, "ms");
        resolve(cleanUrls.map(u => ({ originalUrl: u, enhancedUrl: u, enhanced: false, error: "Enhancement timed out" })));
      }
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdoutData += chunk.toString("utf-8");
    });

    child.stderr.on("data", (chunk) => {
      stderrData += chunk.toString("utf-8");
    });

    child.on("close", (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);

      if (code !== 0 && !stdoutData.trim()) {
        console.warn(`[Python Enhancer] Exited with code ${code}. Stderr: ${stderrData}`);
        resolve(cleanUrls.map(u => ({ originalUrl: u, enhancedUrl: u, enhanced: false, error: stderrData || "Process exit non-zero" })));
        return;
      }

      try {
        const parsed: ImageEnhancerResponse = JSON.parse(stdoutData.trim());
        if (parsed.success && Array.isArray(parsed.results)) {
          resolve(parsed.results);
        } else {
          console.warn("[Python Enhancer] Invalid JSON response payload:", stdoutData);
          resolve(cleanUrls.map(u => ({ originalUrl: u, enhancedUrl: u, enhanced: false })));
        }
      } catch (err: any) {
        console.warn("[Python Enhancer] Failed to parse JSON response:", err.message, "Raw stdout:", stdoutData);
        resolve(cleanUrls.map(u => ({ originalUrl: u, enhancedUrl: u, enhanced: false, error: err.message })));
      }
    });

    child.on("error", (err) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      console.warn("[Python Enhancer] Child process spawn error:", err.message);
      resolve(cleanUrls.map(u => ({ originalUrl: u, enhancedUrl: u, enhanced: false, error: err.message })));
    });

    // Write URLs array as JSON to stdin
    try {
      child.stdin.write(JSON.stringify(cleanUrls));
      child.stdin.end();
    } catch (e: any) {
      console.warn("[Python Enhancer] Error writing to child stdin:", e.message);
    }
  });
}

/**
 * Enhances a batch of product records in-place by enhancing all primary and gallery images
 */
export async function enhanceScrapedProductsBatchWithPython<T extends {
  primaryImage?: string;
  images?: Array<string | { url: string; isPrimary?: boolean }>;
}>(products: T[]): Promise<{ enhancedProducts: T[]; totalEnhanced: number }> {
  if (!products || products.length === 0) {
    return { enhancedProducts: products, totalEnhanced: 0 };
  }

  // 1. Gather all unique image URLs to enhance
  const allImageUrlsSet = new Set<string>();

  for (const p of products) {
    if (p.primaryImage && typeof p.primaryImage === "string" && p.primaryImage.trim().length > 0) {
      allImageUrlsSet.add(p.primaryImage.trim());
    }
    if (Array.isArray(p.images)) {
      for (const item of p.images) {
        if (typeof item === "string" && item.trim().length > 0) {
          allImageUrlsSet.add(item.trim());
        } else if (item && typeof item === "object" && typeof item.url === "string" && item.url.trim().length > 0) {
          allImageUrlsSet.add(item.url.trim());
        }
      }
    }
  }

  const uniqueUrls = Array.from(allImageUrlsSet);
  if (uniqueUrls.length === 0) {
    return { enhancedProducts: products, totalEnhanced: 0 };
  }

  console.log(`[Python Enhancer] Enhancing ${uniqueUrls.length} unique images across ${products.length} products...`);

  // 2. Run Python Enhancer
  const results = await runPythonImageEnhancer(uniqueUrls);
  
  // 3. Build lookup map: originalUrl -> enhancedUrl
  const urlMap = new Map<string, string>();
  let totalEnhanced = 0;

  for (const r of results) {
    if (r && r.enhancedUrl) {
      urlMap.set(r.originalUrl, r.enhancedUrl);
      if (r.enhanced) {
        totalEnhanced++;
      }
    }
  }

  // 4. Map back to products
  const enhancedProducts = products.map((product) => {
    const updated = { ...product };

    if (updated.primaryImage && urlMap.has(updated.primaryImage)) {
      updated.primaryImage = urlMap.get(updated.primaryImage)!;
    }

    if (Array.isArray(updated.images)) {
      updated.images = updated.images.map((img) => {
        if (typeof img === "string") {
          return urlMap.get(img) || img;
        } else if (img && typeof img === "object" && typeof img.url === "string") {
          return {
            ...img,
            url: urlMap.get(img.url) || img.url
          };
        }
        return img;
      });
    }

    return updated;
  });

  console.log(`[Python Enhancer] Successfully processed: ${totalEnhanced}/${uniqueUrls.length} enhanced.`);
  return { enhancedProducts, totalEnhanced };
}
