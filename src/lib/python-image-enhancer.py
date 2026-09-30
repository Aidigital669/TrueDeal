#!/usr/bin/env python3
"""
TrueDeal AI Image Enhancer Framework (Python + Pillow)
======================================================
Super-resolution, contrast optimization, dynamic lighting correction,
and high-frequency detail sharpening for scraped e-commerce catalog assets.
"""

import sys
import os
import json
import hashlib
import io
import time
import base64
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat
except ImportError:
    print(json.dumps({
        "success": False,
        "error": "Pillow is not installed. Please run: pip install Pillow"
    }))
    sys.exit(1)

try:
    import requests
except ImportError:
    requests = None

# Default configuration
DEFAULT_MIN_RESOLUTION = 1000
DEFAULT_QUALITY = 92
DEFAULT_MAX_WORKERS = 8
DEFAULT_OUTPUT_SUBDIR = os.path.join("public", "uploads", "enhanced")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36 TrueDealAI/1.0"
    ),
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/"
}


def compute_image_hash(source_str: str) -> str:
    """Generates a stable 16-character MD5 hash for cache identification."""
    return hashlib.md5(source_str.encode("utf-8", errors="ignore")).hexdigest()[:16]


def get_image_bytes(source: str, project_root: str) -> bytes:
    """Fetches image bytes from URL, base64 data URI, or local filesystem."""
    source_clean = source.strip()

    # 1. Base64 Data URI
    if source_clean.startswith("data:image/"):
        header, b64_data = source_clean.split(",", 1) if "," in source_clean else ("", source_clean)
        return base64.b64decode(b64_data)

    # 2. HTTP / HTTPS URL
    if source_clean.startswith("http://") or source_clean.startswith("https://") or source_clean.startswith("//"):
        url = "https:" + source_clean if source_clean.startswith("//") else source_clean
        if not requests:
            raise RuntimeError("Python requests library is required for URL downloads")
        resp = requests.get(url, headers=HEADERS, timeout=12, verify=False)
        resp.raise_for_status()
        return resp.content

    # 3. Local filesystem path or public web path
    # e.g., /uploads/pdf-extracts/foo.png or relative/absolute path
    local_path = source_clean
    if local_path.startswith("/"):
        # e.g. /uploads/pdf-extracts/... -> public/uploads/pdf-extracts/...
        local_path = os.path.join(project_root, "public", local_path.lstrip("/\\"))
    elif not os.path.isabs(local_path):
        local_path = os.path.join(project_root, local_path)

    if os.path.exists(local_path):
        with open(local_path, "rb") as f:
            return f.read()

    raise FileNotFoundError(f"Cannot resolve image source: {source}")


def enhance_pil_image(img: Image.Image, min_res: int = DEFAULT_MIN_RESOLUTION) -> Image.Image:
    """
    Applies multi-stage e-commerce enhancement pipeline:
    1. EXIF orientation correction
    2. Color space normalization
    3. Lanczos super-resolution / smart upscaling
    4. Auto-contrast & dynamic range stretch
    5. Exposure & luminance balance
    6. Vibrancy & color saturation pop
    7. Dual-pass unsharp masking & edge sharpening
    """
    # 1. Fix EXIF orientation (e.g. mobile uploads that are rotated)
    try:
        img = ImageOps.exif_transpose(img)
    except Exception:
        pass

    # 2. Normalize Color Space
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        # Has transparency: convert with clean background or keep transparent
        alpha = img.convert("RGBA").split()[-1]
        # Check if alpha is mostly opaque
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img.convert("RGBA"), mask=alpha)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    width, height = img.size

    # 3. Super-Resolution / Smart Upscaling
    # Low-res scraped images (e.g., 200x200 or 400x400) look blurry on modern screens.
    max_dim = max(width, height)
    if max_dim < min_res and max_dim > 0:
        scale_factor = min_res / float(max_dim)
        # Cap scaling at 3x to prevent excessive blur on tiny icons
        scale_factor = min(scale_factor, 3.0)
        new_w = max(1, int(width * scale_factor))
        new_h = max(1, int(height * scale_factor))
        img = img.resize((new_w, new_h), resample=Image.Resampling.LANCZOS)
        width, height = new_w, new_h

    # 4. Auto-Contrast & Dynamic Range Expansion
    # Cuts off bottom/top 1% histogram outliers to remove dull gray haze
    try:
        img = ImageOps.autocontrast(img, cutoff=1)
    except Exception:
        pass

    # 5. Luminance & Exposure Normalization
    try:
        stat = ImageStat.Stat(img)
        # Perceived brightness formula: 0.299*R + 0.587*G + 0.114*B
        r_mean, g_mean, b_mean = stat.mean[:3]
        perceived_lum = 0.299 * r_mean + 0.587 * g_mean + 0.114 * b_mean

        if perceived_lum < 115:
            # Underexposed / dark photo: gently boost brightness
            boost = 1.0 + min(0.28, (115 - perceived_lum) / 280.0)
            img = ImageEnhance.Brightness(img).enhance(boost)
        elif perceived_lum > 225:
            # Slightly overexposed / washed out: pull highlights down
            img = ImageEnhance.Brightness(img).enhance(0.96)
    except Exception:
        pass

    # 6. Vibrancy & Color Saturation Enhancement
    # Boost by 14% to give e-commerce products rich, appealing catalog appearance
    try:
        img = ImageEnhance.Color(img).enhance(1.14)
    except Exception:
        pass

    # 7. Contrast Pop
    try:
        img = ImageEnhance.Contrast(img).enhance(1.08)
    except Exception:
        pass

    # 8. Adaptive Sharpening & Micro-Contrast
    # First: Balanced UnsharpMask for crisp details without deep-frying
    try:
        img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=85, threshold=2))
    except Exception:
        pass

    # Second: Balanced sharpness boost
    try:
        img = ImageEnhance.Sharpness(img).enhance(1.12)
    except Exception:
        pass

    return img


def process_single_image(
    source_url: str,
    project_root: str,
    output_dir: str,
    min_res: int = DEFAULT_MIN_RESOLUTION,
    quality: int = DEFAULT_QUALITY
) -> dict:
    """Enhances a single image source and saves it to output directory."""
    if not source_url or not source_url.strip():
        return {
            "originalUrl": source_url,
            "enhancedUrl": source_url,
            "enhanced": False,
            "error": "Empty source URL"
        }

    source_clean = source_url.strip()
    url_hash = compute_image_hash(source_clean)
    filename = f"enhanced_{url_hash}.webp"
    file_path = os.path.join(output_dir, filename)
    public_url = f"/uploads/enhanced/{filename}"

    # Return cached enhanced image if already exists and is valid
    if os.path.exists(file_path) and os.path.getsize(file_path) > 800:
        try:
            with Image.open(file_path) as cached_img:
                w, h = cached_img.size
            return {
                "originalUrl": source_clean,
                "enhancedUrl": public_url,
                "enhanced": True,
                "cached": True,
                "width": w,
                "height": h,
                "sizeBytes": os.path.getsize(file_path)
            }
        except Exception:
            pass

    try:
        raw_bytes = get_image_bytes(source_clean, project_root)
        with Image.open(io.BytesIO(raw_bytes)) as pil_img:
            orig_w, orig_h = pil_img.size
            orig_mode = pil_img.mode

            enhanced_img = enhance_pil_image(pil_img, min_res=min_res)
            new_w, new_h = enhanced_img.size

            # Save to disk as high-quality WebP
            enhanced_img.save(
                file_path,
                format="WEBP",
                quality=quality,
                method=6
            )

        return {
            "originalUrl": source_clean,
            "enhancedUrl": public_url,
            "enhanced": True,
            "cached": False,
            "originalWidth": orig_w,
            "originalHeight": orig_h,
            "width": new_w,
            "height": new_h,
            "sizeBytes": os.path.getsize(file_path)
        }

    except Exception as exc:
        # Fallback gracefully to original URL so imports never break
        return {
            "originalUrl": source_clean,
            "enhancedUrl": source_clean,
            "enhanced": False,
            "error": str(exc)
        }


def enhance_images_batch(
    sources: list,
    project_root: str,
    output_dir: str,
    max_workers: int = DEFAULT_MAX_WORKERS,
    min_res: int = DEFAULT_MIN_RESOLUTION
) -> list:
    """Enhances a batch of image URLs in parallel using ThreadPoolExecutor."""
    os.makedirs(output_dir, exist_ok=True)
    results = [None] * len(sources)

    workers = min(max_workers, max(1, len(sources)))
    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_index = {
            executor.submit(
                process_single_image,
                url,
                project_root,
                output_dir,
                min_res
            ): idx
            for idx, url in enumerate(sources)
        }

        for future in as_completed(future_to_index):
            idx = future_to_index[future]
            try:
                results[idx] = future.result()
            except Exception as e:
                results[idx] = {
                    "originalUrl": sources[idx],
                    "enhancedUrl": sources[idx],
                    "enhanced": False,
                    "error": str(e)
                }

    return results


def main():
    parser = argparse.ArgumentParser(description="TrueDeal AI Python Image Enhancer")
    parser.add_argument("--input", type=str, help="Path to JSON file containing array of image URLs or single URL")
    parser.add_argument("--url", type=str, help="Single image URL to enhance")
    parser.add_argument("--output-dir", type=str, help="Target directory for enhanced images")
    parser.add_argument("--root", type=str, help="Project root directory path")
    parser.add_argument("--min-res", type=int, default=DEFAULT_MIN_RESOLUTION, help="Minimum target resolution")
    args = parser.parse_args()

    # Determine project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = args.root or os.path.abspath(os.path.join(script_dir, "..", ".."))

    # Determine output directory
    output_dir = args.output_dir or os.path.join(project_root, DEFAULT_OUTPUT_SUBDIR)
    os.makedirs(output_dir, exist_ok=True)

    # Disable SSL warnings for self-signed or unverified scrape CDN certs
    if requests:
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    start_time = time.time()
    urls_to_process = []

    # Read inputs
    if args.url:
        urls_to_process = [args.url]
    elif args.input:
        if os.path.exists(args.input):
            with open(args.input, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    urls_to_process = data
                elif isinstance(data, dict) and "images" in data:
                    urls_to_process = data["images"]
                elif isinstance(data, str):
                    urls_to_process = [data]
        else:
            try:
                data = json.loads(args.input)
                urls_to_process = data if isinstance(data, list) else [str(data)]
            except Exception:
                urls_to_process = [args.input]
    else:
        # Read from stdin
        stdin_content = sys.stdin.read().strip()
        if stdin_content:
            try:
                data = json.loads(stdin_content)
                if isinstance(data, list):
                    urls_to_process = data
                elif isinstance(data, dict) and "images" in data:
                    urls_to_process = data["images"]
                elif isinstance(data, str):
                    urls_to_process = [data]
            except Exception:
                urls_to_process = [l.strip() for l in stdin_content.splitlines() if l.strip()]

    if not urls_to_process:
        print(json.dumps({
            "success": True,
            "results": [],
            "stats": {"total": 0, "enhanced": 0, "durationMs": 0}
        }))
        return

    results = enhance_images_batch(
        urls_to_process,
        project_root,
        output_dir,
        min_res=args.min_res
    )

    duration_ms = int((time.time() - start_time) * 1000)
    enhanced_count = sum(1 for r in results if r and r.get("enhanced"))

    response = {
        "success": True,
        "results": results,
        "stats": {
            "total": len(results),
            "enhanced": enhanced_count,
            "durationMs": duration_ms
        }
    }

    print(json.dumps(response, indent=2))


if __name__ == "__main__":
    main()
