import type { Metadata } from "next";
import { Exo } from "next/font/google";
import "./globals.css";
import Script from "next/script";


const exo = Exo({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-exo'
})




export const metadata: Metadata = {
  title: "AfroSpook | Afro-Mystic Carnival & Rave Experience",
  description:
    "AfroSpook is the ultimate Afro-mystic carnival and rave experience in Benin City, Edo State, Nigeria. A night of spirits, masks, music, art installations, and electrifying performances — gates open 2 PM, event starts 7 PM till dawn.",
  keywords: [
    "AfroSpook",
    "Afro Mystic Carnival",
    "Benin City Events",
    "Edo State Party",
    "Afro Rave Nigeria",
    "Carnival in Nigeria",
    "Afro-mysticism",
    "Rave Party Nigeria",
    "Music Festival Nigeria",
  ],
  authors: [{ name: "AfroSpook" }],
  creator: "AfroSpook",
  publisher: "AfroSpook",
  metadataBase: new URL("https://afrospook.com"),
  openGraph: {
    title: "AfroSpook | Afro-Mystic Carnival & Rave Experience",
    description:
      "Join AfroSpook at Image Garden, Benin City — Parade of Spirits & Masks, High-Energy Rave Arena, Mystic Chill Zones, Afro-mysticism Performances, Live DJs & Art Installations.",
    url: "https://afrospook.com",
    siteName: "AfroSpook",
    images: [
      {
        url: "/afrospook-logo.png",
        width: 1200,
        height: 630,
        alt: "AfroSpook Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AfroSpook | Afro-Mystic Carnival & Rave Experience",
    description:
      "The Afro-mystic carnival rave in Benin City, Edo State. Spirits, masks, DJs, art, and endless vibes till dawn.",
    images: ["/afrospook-logo.png"],
    creator: "@afro_spook", // replace if you have an official Twitter handle
  },
  icons: {
    icon: "/ico.ico",
    shortcut: "/ico.ico",
    apple: "/ico.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Monnify SDK */}
        <Script
          src="https://sdk.monnify.com/plugin/monnify.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${exo.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
