import type { Metadata } from "next";
import { Bodoni_Moda, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Perfect Haircut | Visage Analytics",
  description: "AI-driven facial geometry analysis to suggest your perfect haircut.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodoni.variable} ${outfit.variable}`}>
        <div className="grain-overlay"></div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
