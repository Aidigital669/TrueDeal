import { enhanceScrapedProductsBatchWithPython } from "../src/lib/python-image-enhancer";

async function runTest() {
  console.log("Testing enhanceScrapedProductsBatchWithPython...");

  const mockProducts = [
    {
      title: "Sample Wireless Earbuds",
      price: 1999,
      primaryImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=280",
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=280",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=280"
      ]
    }
  ];

  const startTime = Date.now();
  const res = await enhanceScrapedProductsBatchWithPython(mockProducts);
  const elapsed = Date.now() - startTime;

  console.log("Execution Time (ms):", elapsed);
  console.log("Total Enhanced:", res.totalEnhanced);
  console.log("Enhanced Products Result:", JSON.stringify(res.enhancedProducts, null, 2));

  if (res.totalEnhanced > 0 && res.enhancedProducts[0].primaryImage.includes("/uploads/enhanced/")) {
    console.log("TEST PASSED: Images were enhanced and converted to WebP!");
  } else {
    console.error("TEST FAILED: Primary image was not enhanced as expected.");
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error("Test Exception:", err);
  process.exit(1);
});
