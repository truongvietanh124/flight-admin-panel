// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// --- IMPORT AUTH PROVIDER ---
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flight Admin Panel", // Thay đổi tiêu đề nếu muốn
  description: "Admin panel for flight management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* --- BỌC CHILDREN BẰNG AUTH PROVIDER --- */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}