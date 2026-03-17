"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const pathname = usePathname();

    const navLinks = [
        { name: "Learn", href: "/learn" },
        { name: "Test Yourself", href: "/test" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-[#0a0c0f]/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Brain className="h-8 w-8 text-cyan-400 transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 h-8 w-8 animate-pulse bg-cyan-400/20 blur-xl rounded-full" />
                        </div>
                        <span className="font-syne text-xl font-bold tracking-tight text-white glow-text">
                            NeuroLearn
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                                        isActive
                                            ? "text-cyan-400 bg-cyan-400/10"
                                            : "text-slate-400 hover:text-cyan-300 hover:bg-white/5",
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white border border-white/20 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                        DT
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_1px_10px_rgba(0,212,255,0.5)]" />
        </nav>
    );
};

export default Navbar;
