import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TRPCReactProvider } from "@/lib/api/client"

import "@/styles/globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  description: "Convert urls to qr codes",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icon-light.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icon-dark.svg",
      },
    ],
  },
  title: "URL to QR",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCReactProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
