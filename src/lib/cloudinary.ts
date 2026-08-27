export async function uploadImageToCloudinary(file: File) {
  console.log("Stub: Uploading image to Cloudinary", file.name);
  // Implementation will use cloudinary SDK or direct API call
  return {
    url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    success: true
  };
}
