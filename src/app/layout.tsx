import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PelisMax — Descubre películas",
  description: "Catálogo de películas por categoría",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#14181c] text-white">
        <Header />
        <div className="pt-12 flex-1">{children}</div>
      </body>
    </html>
  );
}
