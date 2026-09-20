import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import { AiAssistantChatbot } from "@/components/ai-assistant-chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntelliHire v3 — AI Career Intelligence & Placement Platform",
  description:
    "Enterprise AI platform featuring Document Ingestion, NLP Structuring, Hybrid ATS Search, Assessment Telemetry, Isolated Code Sandboxing, TreeSHAP Explainability, and EEOC 80% Fairness Auditing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-background text-foreground antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          {/* Skip link for screen reader and keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold shadow-xl"
          >
            Skip to main content
          </a>

          <Navigation />

          <main
            id="main-content"
            className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <PageTransition>{children}</PageTransition>
          </main>

          <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-6 text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">IntelliHire v3.0</span>
                <span>•</span>
                <span>Munder Difflin Enterprise Architecture</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400">✓ EEOC 80% Rule Compliant</span>
                <span>•</span>
                <span className="text-purple-400">✓ NYC LL144 Audited</span>
                <span>•</span>
                <span className="text-blue-400">✓ Isolated Process Sandbox</span>
                <span>•</span>
                <span>Cloudflare Edge D1+KV+R2</span>
              </div>
            </div>
          </footer>

          {/* Global AI Career Assistant Floating Chatbot */}
          <AiAssistantChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}
