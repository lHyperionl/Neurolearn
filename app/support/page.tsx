"use client";

import { motion } from "framer-motion";
import Sidebar from "@/components/nav/Sidebar";
import { useSettings, translations, type TranslationKey } from "@/components/SettingsProvider";

const BUG_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@neurolearn.app";
const BUG_SUBJECT = encodeURIComponent("Bug Report — NeuroLearn");
const BUG_BODY = encodeURIComponent(
    "Describe the bug:\n\n\nSteps to reproduce:\n1. \n2. \n\nExpected behaviour:\n\nActual behaviour:\n"
);
const FEATURE_SUBJECT = encodeURIComponent("Feature Suggestion — NeuroLearn");
const FEATURE_BODY = encodeURIComponent(
    "Feature title:\n\n\nDescribe the feature:\n\n\nWhy would it be useful?\n\n"
);

export default function SupportPage() {
    const { language } = useSettings();
    const t = (key: TranslationKey) => translations[language][key];

    return (
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="relative flex-1 bg-[#0c0e11] overflow-y-auto">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-24 -right-32 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
                    <div className="absolute bottom-0 -left-20 w-64 h-64 bg-amber-500/10 blur-[120px]" />
                    <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#2a2f35_1px,transparent_1px),linear-gradient(to_bottom,#2a2f35_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="relative z-10 max-w-5xl mx-auto px-6 py-10"
                >
                    <div className="mb-8">
                        <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">
                            Help
                        </div>
                        <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">
                            {t("support.title")}
                        </h1>
                        <p className="text-sm text-slate-400 mt-2">
                            {t("support.subtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left column — Get Support */}
                        <div className="space-y-4">
                            <div className="mb-2">
                                <h2 className="font-syne text-xl font-bold text-[#e2e2e6]">
                                    {t("support.getSupport")}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    {t("support.getSupportSubtitle")}
                                </p>
                            </div>

                            {/* Bug Report card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.05 }}
                                className="border border-[#3c494e] bg-[#14171c]/80 p-6"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-red-400">bug_report</span>
                                    <h3 className="font-mono text-xs uppercase tracking-widest text-slate-300">
                                        {t("support.bugReport")}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">
                                    {t("support.bugReportDesc")}
                                </p>
                                <a
                                    href={`mailto:${BUG_EMAIL}?subject=${BUG_SUBJECT}&body=${BUG_BODY}`}
                                    className="inline-flex items-center gap-2 bg-[#00d4ff] text-[#071119] px-4 py-2 font-mono text-xs uppercase tracking-widest font-semibold hover:bg-[#00d4ff]/80 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">mail</span>
                                    {t("support.bugBtn")}
                                </a>
                            </motion.div>

                            {/* Feature Request card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.1 }}
                                className="border border-[#3c494e] bg-[#14171c]/80 p-6"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-amber-400">lightbulb</span>
                                    <h3 className="font-mono text-xs uppercase tracking-widest text-slate-300">
                                        {t("support.featureRequest")}
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-400 mb-4">
                                    {t("support.featureRequestDesc")}
                                </p>
                                <a
                                    href={`mailto:${BUG_EMAIL}?subject=${FEATURE_SUBJECT}&body=${FEATURE_BODY}`}
                                    className="inline-flex items-center gap-2 border border-[#00d4ff] text-[#00d4ff] px-4 py-2 font-mono text-xs uppercase tracking-widest font-semibold hover:bg-[#00d4ff]/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    {t("support.featureBtn")}
                                </a>
                            </motion.div>
                        </div>

                        {/* Right column — Support Us */}
                        <div className="space-y-4">
                            <div className="mb-2">
                                <h2 className="font-syne text-xl font-bold text-[#e2e2e6]">
                                    {t("support.supportUs")}
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    {t("support.supportUsSubtitle")}
                                </p>
                            </div>

                            {/* Built by TUKE card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.15 }}
                                className="relative border border-[#3c494e] bg-[#14171c]/80 p-6 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-cyan-400">school</span>
                                        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-300">
                                            TUKE
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium mb-2">
                                        {t("support.builtBy")}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {t("support.builtByDesc")}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Feedback card */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: 0.2 }}
                                className="relative border border-[#3c494e] bg-[#14171c]/80 p-6 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-amber-400">favorite</span>
                                        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-300">
                                            {t("support.feedbackCard")}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        {t("support.feedbackDesc")}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
