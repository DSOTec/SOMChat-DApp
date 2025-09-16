import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/components/web3-provider"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto-mono",
})

export const metadata: Metadata = {
  title: "SOMChat - The Future of Secure Messaging",
  description:
    "Experience truly decentralized communication with your ENS identity. Own your conversations, protect your privacy, and connect with the Web3 community.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${poppins.variable} ${robotoMono.variable} antialiased`}>
        <Web3Provider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
