import { Metadata } from "next";
import { ChatGPTInterface } from "@/components/chat/ChatGPTInterface";
import { getCurrentUserSession } from "@/lib/auth-actions";

export async function generateMetadata(props: {
  searchParams?: Promise<{ q?: string; seller?: string }>;
}): Promise<Metadata> {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const q = searchParams?.q?.trim();

  if (q) {
    const title = `${q} - TrueDeal Search & Verified Marketplace`;
    const description = `Discover verified real estate, commercial spaces, and direct builder listings for "${q}" on TrueDeal.`;
    return {
      title,
      description,
      alternates: {
        canonical: `https://truedeal.in/chat?q=${encodeURIComponent(q)}`,
      },
      openGraph: {
        title: `${q} | TrueDeal Marketplace`,
        description,
        url: `https://truedeal.in/chat?q=${encodeURIComponent(q)}`,
        siteName: "TrueDeal",
        images: [{ url: "/truedeal.png" }],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${q} | TrueDeal`,
        description,
      },
    };
  }

  return {
    title: "TrueDeal AI - Real Estate & Verified Marketplace Assistant",
    description:
      "Chat with TrueDeal AI to discover verified commercial properties, showrooms, office spaces, and direct developers.",
    alternates: {
      canonical: "https://truedeal.in/chat",
    },
  };
}

export default async function ChatPage(props: {
  searchParams?: Promise<{ q?: string; seller?: string }>;
}) {
  const [user, searchParams] = await Promise.all([
    getCurrentUserSession(),
    props.searchParams ? props.searchParams : Promise.resolve(undefined),
  ]);

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#212121]">
      <ChatGPTInterface
        initialQuery={searchParams?.q}
        initialSeller={searchParams?.seller}
        currentUser={
          user
            ? {
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null
        }
      />
    </div>
  );
}
