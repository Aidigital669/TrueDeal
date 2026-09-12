import { Metadata } from "next";
import { ChatGPTInterface } from "@/components/chat/ChatGPTInterface";
import { getCurrentUserSession } from "@/lib/auth-actions";

export const metadata: Metadata = {
  title: "TrueDeal AI - Marketplace Assistant",
  description: "Chat with TrueDeal AI to discover products, services, properties, and direct verified sellers."
};

export default async function ChatPage() {
  const user = await getCurrentUserSession();

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#212121]">
      <ChatGPTInterface
        currentUser={
          user
            ? {
                name: user.name,
                email: user.email,
                role: user.role
              }
            : null
        }
      />
    </div>
  );
}
