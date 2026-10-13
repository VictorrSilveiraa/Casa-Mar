import type { Metadata } from "next";
import localFont from "next/font/local";
import { content } from "@/lib/content";
import { imageSrcSet } from "@/lib/images";
import { siteConfig } from "@/lib/site.config";
import "./globals.css";

const jost300 = localFont({ src: "./fonts/jost-latin-300.woff2", weight: "300", display: "swap", preload: false, variable: "--jost-300" });
const jost400 = localFont({ src: "./fonts/jost-latin-400.woff2", weight: "400", display: "swap", preload: true, variable: "--jost-400" });
const jost500 = localFont({ src: "./fonts/jost-latin-500.woff2", weight: "500", display: "swap", preload: false, variable: "--jost-500" });
const newsreader300 = localFont({ src: "./fonts/newsreader-latin-300.woff2", weight: "300", display: "swap", preload: true, variable: "--newsreader-300" });
const newsreader400 = localFont({ src: "./fonts/newsreader-latin-400.woff2", weight: "400", display: "swap", preload: false, variable: "--newsreader-400" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl || "http://localhost:3000"),
  title: content.metadata.title,
  description: content.metadata.description,
  alternates: siteConfig.siteUrl ? { canonical: siteConfig.siteUrl } : undefined,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: content.metadata.title,
    description: content.metadata.description,
    images: [{ url: "/media/hero-villa-1440.webp", width: 1440, height: 810, alt: "Fachada da Casa Praiamar entre coqueiros" }],
  },
  twitter: { card: "summary_large_image", title: content.metadata.title, description: content.metadata.description, images: ["/media/hero-villa-1440.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${jost300.variable} ${jost400.variable} ${jost500.variable} ${newsreader300.variable} ${newsreader400.variable}`}>
      <head>
        <link rel="preload" as="image" imageSrcSet={imageSrcSet("heroDesktop", "avif")} imageSizes="100vw" type="image/avif" media="(max-width: 767px)" fetchPriority="high" />
        <link rel="preload" as="image" imageSrcSet={imageSrcSet("heroDesktop", "avif")} imageSizes="100vw" type="image/avif" media="(min-width: 768px)" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
