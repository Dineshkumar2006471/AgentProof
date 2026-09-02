import type { Metadata } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/posthog-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://agent-proof.dev"),
  title: {
    default: "AgentProof | AI Agent Verification and Testing",
    template: "%s | AgentProof"
  },
  description:
    "Verify AI agents with executable contracts, real endpoint tests, reliability evidence, and shareable verification reports.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "AgentProof",
    title: "AgentProof | AI Agent Verification and Testing",
    description: "Turn AI agent promises into executable tests and verifiable reliability evidence.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "AgentProof AI agent verification and testing"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentProof | AI Agent Verification and Testing",
    description: "Turn AI agent promises into executable tests and verifiable reliability evidence.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AgentProof AI agent verification and testing"
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--color-paper-cream)] text-[var(--color-on-surface)] font-body-md antialiased selection:bg-[var(--color-seal-indigo)] selection:text-white" suppressHydrationWarning><PostHogProvider>{children}</PostHogProvider></body>
    </html>
  );
}
