import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeskAgents — Your AI Employees",
  description:
    "Managed AI agents that handle email, calendar, customer support, and data entry — so you can focus on growing your business.",
  openGraph: {
    title: "DeskAgents — Your AI Employees",
    description:
      "Managed AI agents for non-technical users. Automate everything from email to Kintone workflows.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
