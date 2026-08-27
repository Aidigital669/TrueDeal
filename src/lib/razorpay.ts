export async function createRazorpayOrder(amount: number) {
  console.log("Stub: Creating Razorpay order for amount", amount);
  // Implementation will use Razorpay SDK
  return {
    id: "order_stub_123",
    amount: amount,
    currency: "INR",
    status: "created"
  };
}

export async function verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
  console.log("Stub: Verifying Razorpay payment", { orderId, paymentId });
  return true;
}
