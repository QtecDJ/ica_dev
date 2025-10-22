import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infinity Cheer Allstars - Backoffice",
  description: "Verwaltungssystem für Infinity Cheer Allstars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
