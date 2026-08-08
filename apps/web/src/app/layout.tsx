import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrueState | Clinical AI Integrity Platform",
  description:
    "The first uncorrupted clinical intelligence stack — real-time governance, causal debiasing, and conformal decision support for health systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
