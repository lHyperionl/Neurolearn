"use client";

import { motion } from "framer-motion";
import Sidebar from "@/components/nav/Sidebar";
import { useSettings, translations, type TranslationKey } from "@/components/SettingsProvider";
import { cn } from "@/lib/utils";

type FontSize = "small" | "medium" | "large";
type Language = "en" | "sk";

const fontSizes: { value: FontSize; key: TranslationKey }[] = [
    { value: "small", key: "settings.small" },
    { value: "medium", key: "settings.medium" },
    { value: "large", key: "settings.large" },
];

const languages: { value: Language; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "sk", label: "SK" },
];

export default function SettingsPage() {
    const { fontSize, language, setFontSize, setLanguage } = useSettings();
    const t = (key: TranslationKey) => translations[language][key];

    return (
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="relative flex-1 bg-[#0c0e11]">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-24 -right-32 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
                    <div className="absolute top-1/3 -left-20 w-48 h-48 bg-amber-500/10 blur-[120px]" />
                    <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#2a2f35_1px,transparent_1px),linear-gradient(to_bottom,#2a2f35_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="relative z-10 max-w-2xl mx-auto px-6 py-10"
                >
                    <div className="mb-8">
                        <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">
                            System
                        </div>
                        <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">
                            {t("settings.title")}
                        </h1>
                        <p className="text-sm text-slate-400 mt-2">
                            {t("settings.subtitle")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Font Size */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.05 }}
                            className="border border-[#3c494e] bg-[#14171c]/80 p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-cyan-400">text_fields</span>
                                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-300">
                                    {t("settings.fontSize")}
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                {fontSizes.map(({ value, key }) => (
                                    <button
                                        key={value}
                                        onClick={() => setFontSize(value)}
                                        className={cn(
                                            "flex-1 py-2 px-4 font-mono text-xs uppercase tracking-widest border transition-all",
                                            fontSize === value
                                                ? "bg-[#00d4ff]/15 border-[#00d4ff] text-[#00d4ff]"
                                                : "border-[#3c494e] text-slate-500 hover:border-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        {t(key)}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Language */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                            className="border border-[#3c494e] bg-[#14171c]/80 p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-cyan-400">language</span>
                                <h2 className="font-mono text-xs uppercase tracking-widest text-slate-300">
                                    {t("settings.language")}
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                {languages.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setLanguage(value)}
                                        className={cn(
                                            "py-2 px-6 font-mono text-xs uppercase tracking-widest border transition-all",
                                            language === value
                                                ? "bg-[#00d4ff]/15 border-[#00d4ff] text-[#00d4ff]"
                                                : "border-[#3c494e] text-slate-500 hover:border-slate-500 hover:text-slate-300"
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                {t("settings.languageNote")}
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
