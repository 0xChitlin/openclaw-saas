import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeskAgents — Your AI Employees",
  description:
    "Managed AI agents that handle email, calendar, support, and data entry for your business.",
  openGraph: {
    title: "DeskAgents — Your AI Employees",
    description:
      "Managed AI agents that handle email, calendar, support, and data entry for your business.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
