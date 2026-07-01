import type { Metadata } from "next";
import Script from "next/script";
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
    default: "Credit Cache",
    template: "%s | Credit Cache",
  },
  description:
    "Credit Cache helps users discover opportunities, scholarships, sweepstakes, lottery entries, and win recovery options in one trusted place.",
  keywords: [
    "Credit Cache",
    "opportunities",
    "scholarships",
    "sweepstakes",
    "lottery",
    "win recovery",
    "free account",
    "support center",
  ],
  authors: [{ name: "Credit Cache" }],
  creator: "Credit Cache",
  publisher: "Credit Cache",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Credit Cache",
    title: "Credit Cache",
    description:
      "Discover opportunities, scholarships, sweepstakes, lottery entries, and win recovery options with Credit Cache.",
    images: [
      {
        url: "/cc.jpg",
        width: 1200,
        height: 630,
        alt: "Credit Cache",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit Cache",
    description:
      "Discover opportunities, scholarships, sweepstakes, lottery entries, and win recovery options with Credit Cache.",
    images: ["/cc.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="platform-font-detect" strategy="beforeInteractive">
          {`(function () {
            try {
              var ua = navigator.userAgent || navigator.vendor || window.opera;
              var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
              var isAndroid = /Android/i.test(ua);
              document.documentElement.dataset.platform = isIOS ? 'ios' : isAndroid ? 'android' : 'other';
            } catch (e) {
              document.documentElement.dataset.platform = 'other';
            }
          })();`}
        </Script>
      </head>

      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}