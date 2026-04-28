"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/nav/Sidebar";

const cards = [
    {
        title: "Learn",
        description: "Interactive MRI cases with diagnosis walkthroughs.",
        href: "/learn",
        accent: "from-cyan-500/30 via-transparent to-transparent",
    },
    {
        title: "Test",
        description: "Timed MRI quiz to sharpen diagnostic skills.",
        href: "/test",
        accent: "from-amber-500/30 via-transparent to-transparent",
    },
];

export default function DashboardPage() {
    return (
        <div className="flex flex-1 overflow-hidden bg-[#0c0e11] text-slate-100">
            <Sidebar />
            <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[120px]" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-500/10 blur-[120px]" />
                    <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#2a2f35_1px,transparent_1px),linear-gradient(to_bottom,#2a2f35_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>
                <main className="relative z-10 flex-1 min-h-0 flex items-center justify-center p-6">
                    <div className="w-full max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-10"
                        >
                            <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">
                                Neurolearn Dashboard
                            </div>
                            <h1 className="font-syne text-5xl md:text-6xl font-extrabold text-[#e2e2e6] tracking-tight mt-3">
                                Choose your next session
                            </h1>
                            <p className="text-xl text-slate-400 mt-4 max-w-2xl mx-auto">
                                Jump into guided cases or test your pattern recognition skills.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cards.map((card, index) => (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.45, delay: index * 0.1 }}
                                    className="relative"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                                    <Link
                                        href={card.href}
                                        className="relative block h-full border border-[#3c494e] bg-[#14171c]/90 p-6 transition-all hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(0,212,255,0.12)]"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-slate-500">
                                                Module
                                            </div>
                                            <span className="material-symbols-outlined text-cyan-300">north_east</span>
                                        </div>
                                        <h2 className="font-syne text-3xl font-bold text-[#e2e2e6] mt-4">
                                            {card.title}
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-3">
                                            {card.description}
                                        </p>
                                        <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase text-cyan-300">
                                            Open {card.title}
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
