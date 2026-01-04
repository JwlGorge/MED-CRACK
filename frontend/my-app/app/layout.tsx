import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Med-Cracker",
    default: "Med-Cracker | NEET Preparation Platform",
  },
  description: "The ultimate platform for NEET medical entrance exam preparation. Practice questions, take quizzes, and track your progress.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://medcrack.in"),
  verification: {
    google: "aqisQgZER-9IgvNT4zDuaNsoZH67TrgHjvImZ2Y64_8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;

}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
