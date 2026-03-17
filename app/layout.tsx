import type { Metadata } from "next";
import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
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
            <body
                className={`${syne.variable} ${jetbrainsMono.variable} ${dmSans.variable} font-sans antialiased bg-[#0a0c0f] text-slate-200 min-h-screen selection:bg-cyan-500/30`}
            >
                <div className="fixed inset-0 pointer-events-none z-50 scanline opacity-[0.03]" />
                <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.05),transparent_70%)]" />
                <TooltipProvider>
                    <div className="relative z-10 flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-1">{children}</main>
                    </div>
                </TooltipProvider>
            </body>
        </html>
    );
}
