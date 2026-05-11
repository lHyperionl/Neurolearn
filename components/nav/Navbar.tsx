"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
    const pathname = usePathname();

    const navLinks = [
        { name: "Learn", href: "/learn", icon: "school" },
        { name: "Test Yourself", href: "/test", icon: "assignment" },
    ];

    return (
        <header className="bg-[#0c0e11] backdrop-blur-xl bg-opacity-80 border-b border-[#00d4ff]/30 shadow-[0_1px_10px_rgba(0,212,255,0.2)] sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4">
            <Link
                href="/dashboard"
                className="text-xl font-bold text-[#00d4ff] tracking-tighter flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                <span className="material-symbols-outlined text-[#00d4ff]">
                    psychology
                </span>
                <span className="font-syne uppercase tracking-widest text-sm">
                    NeuroLearn
                </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "font-syne uppercase tracking-widest text-sm transition-colors flex items-center gap-2",
                                isActive
                                    ? "text-[#00d4ff] border-b-2 border-[#00d4ff] pb-1"
                                    : "text-slate-400 hover:text-[#00d4ff]",
                            )}
                        >
                            <span className="material-symbols-outlined text-lg">
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex items-center"></div>
        </header>
    );
};

export default Navbar;
