"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/nav/Sidebar";
import { useSettings, translations, type TranslationKey } from "@/components/SettingsProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function submitFeedback(type: "bug" | "feature", subject: string, body: string) {
    const tryUrls = [`${API_URL}/feedback`, "http://127.0.0.1:8000/feedback"];
    let lastErr = "Failed to submit";
    for (const url of tryUrls) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, subject, body }),
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                lastErr = json.detail ?? res.statusText;
                continue;
            }
            return null;
        } catch (err) {
            lastErr = err instanceof Error ? err.message : String(err);
        }
    }
    return lastErr;
}

function FeedbackForm({
    type,
    icon,
    iconColor,
    accentColor,
    title,
    description,
    subjectPlaceholder,
    bodyPlaceholder,
    submitLabel,
    submittingLabel,
    successMsg,
}: {
    type: "bug" | "feature";
    icon: string;
    iconColor: string;
    accentColor: string;
    title: string;
    description: string;
    subjectPlaceholder: string;
    bodyPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    successMsg: string;
}) {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const err = await submitFeedback(type, subject, body);
        setSubmitting(false);
        if (err) {
            setError(err);
        } else {
            setSuccess(true);
            setSubject("");
            setBody("");
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: type === "bug" ? 0.05 : 0.1 }}
            className="border border-[#3c494e] bg-[#14171c]/80 p-6"
        >
            <div className="flex items-center gap-3 mb-4">
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                <h3 className="font-mono text-xs uppercase tracking-widest text-slate-300">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">{description}</p>

            {success ? (
                <div className="flex items-center gap-2 text-sm text-green-400">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {successMsg}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={subjectPlaceholder}
                        className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
                    />
                    <textarea
                        required
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={bodyPlaceholder}
                        rows={4}
                        className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2 resize-none"
                    />
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest font-semibold disabled:opacity-50 transition-colors ${accentColor}`}
                    >
                        <span className="material-symbols-outlined text-sm">{type === "bug" ? "mail" : "send"}</span>
                        {submitting ? submittingLabel : submitLabel}
                    </button>
                </form>
            )}
        </motion.div>
    );
}

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
                        <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">Help</div>
                        <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">
                            {t("support.title")}
                        </h1>
                        <p className="text-sm text-slate-400 mt-2">{t("support.subtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left column — Get Support */}
                        <div className="space-y-4">
                            <div className="mb-2">
                                <h2 className="font-syne text-xl font-bold text-[#e2e2e6]">{t("support.getSupport")}</h2>
                                <p className="text-sm text-slate-400 mt-1">{t("support.getSupportSubtitle")}</p>
                            </div>

                            <FeedbackForm
                                type="bug"
                                icon="bug_report"
                                iconColor="text-red-400"
                                accentColor="bg-[#00d4ff] text-[#071119] hover:bg-[#00d4ff]/80"
                                title={t("support.bugReport")}
                                description={t("support.bugReportDesc")}
                                subjectPlaceholder={language === "sk" ? "Krátky popis chyby…" : "Short bug summary…"}
                                bodyPlaceholder={language === "sk" ? "Kroky na reprodukciu, čo sa stalo, čo ste očakávali…" : "Steps to reproduce, what happened, what you expected…"}
                                submitLabel={t("support.bugBtn")}
                                submittingLabel={language === "sk" ? "Odosiela sa…" : "Sending…"}
                                successMsg={language === "sk" ? "Ďakujeme! Hlásenie bolo odoslané." : "Thank you! Report submitted."}
                            />

                            <FeedbackForm
                                type="feature"
                                icon="lightbulb"
                                iconColor="text-amber-400"
                                accentColor="border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10"
                                title={t("support.featureRequest")}
                                description={t("support.featureRequestDesc")}
                                subjectPlaceholder={language === "sk" ? "Názov návrhu…" : "Feature title…"}
                                bodyPlaceholder={language === "sk" ? "Opíšte nápad a prečo by bol užitočný…" : "Describe the idea and why it would be useful…"}
                                submitLabel={t("support.featureBtn")}
                                submittingLabel={language === "sk" ? "Odosiela sa…" : "Sending…"}
                                successMsg={language === "sk" ? "Ďakujeme! Návrh bol odoslaný." : "Thank you! Suggestion submitted."}
                            />
                        </div>

                        {/* Right column — Support Us */}
                        <div className="space-y-4">
                            <div className="mb-2">
                                <h2 className="font-syne text-xl font-bold text-[#e2e2e6]">{t("support.supportUs")}</h2>
                                <p className="text-sm text-slate-400 mt-1">{t("support.supportUsSubtitle")}</p>
                            </div>

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
                                        <h3 className="font-mono text-xs uppercase tracking-widest text-slate-300">TUKE</h3>
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium mb-2">{t("support.builtBy")}</p>
                                    <p className="text-sm text-slate-400">{t("support.builtByDesc")}</p>
                                </div>
                            </motion.div>

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
                                    <p className="text-sm text-slate-400">{t("support.feedbackDesc")}</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
