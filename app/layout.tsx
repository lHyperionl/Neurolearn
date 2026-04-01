import type { Metadata } from "next";
import { Syne, JetBrains_Mono, DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/nav/Navbar";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

export const metadata: Metadata = {
    title: "NeuroLearn | Medical MRI Education",
    description: "Learn to classify brain diagnoses from MRI scans.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
                />
            </head>
            <body
                className={`${syne.variable} ${jetbrainsMono.variable} ${dmSans.variable} ${spaceGrotesk.variable} antialiased`}
            >
                <div className="fixed inset-0 pointer-events-none z-50 scanline opacity-[0.03]" />
                <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05),transparent_70%)]" />
                <TooltipProvider>
                    <div className="relative z-10 flex flex-col min-h-screen">
                        <Navbar />
                        {children}
                    </div>
                </TooltipProvider>
            </body>
        </html>
    );
}
