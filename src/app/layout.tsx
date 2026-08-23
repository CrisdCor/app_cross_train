import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const audiowide = localFont({
  src: "./fonts/audiowide-400.woff2",
  weight: "400",
  variable: "--font-audiowide",
  display: "swap",
});

const exo2 = localFont({
  src: [
    { path: "./fonts/exo2-300.woff2", weight: "300" },
    { path: "./fonts/exo2-400.woff2", weight: "400" },
    { path: "./fonts/exo2-700.woff2", weight: "700" },
  ],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "App Cross Train",
  description: "Rutinas y seguimiento para entrenadores y atletas de CrossFit.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${audiowide.variable} ${exo2.variable}`}>
      <body className="min-h-dvh bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
