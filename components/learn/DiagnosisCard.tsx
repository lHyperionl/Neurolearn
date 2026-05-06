"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DiagnosisInfo {
    name: string;
    shortName?: string;
    signature?: string;
    grade?: string;
    tags?: string[];
    description?: string;
    keyFeatures?: string[];
    differentials?: string[];
}

interface DiagnosisCardProps {
    diagnosis: DiagnosisInfo;
}

const DiagnosisCard = ({ diagnosis }: DiagnosisCardProps) => {
    const [featuresOpen, setFeaturesOpen] = useState(true);
    const tags = diagnosis.tags ?? [];
    const keyFeatures = diagnosis.keyFeatures ?? [];
    const differentials = diagnosis.differentials ?? [];

    const name = diagnosis.name ?? diagnosis.shortName ?? "UNSPECIFIED CASE";
    const description =
        diagnosis.description ||
        "Clinical details for this specific neuroimaging case are retrieved from the BIDS dataset participant metadata.";

    return (
        <div className="bg-[#1e2023] border border-[#3c494e] p-6 relative h-full flex flex-col">
            <div className="absolute top-4 right-4 flex gap-2 flex-wrap max-w-[55%] justify-end">
                {diagnosis.grade && (
                    <span className="px-2 py-0.5 border border-[#ffb4ab]/50 text-[#ffb4ab] text-[10px] font-mono uppercase">
                        {diagnosis.grade}
                    </span>
                )}
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-2 py-0.5 border border-[#ffb95f]/50 text-[#ffb95f] text-[10px] font-mono uppercase"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tighter mb-2 pr-36 leading-none uppercase">
                {name}
            </h1>

            {diagnosis.signature && (
                <p className="text-sm text-cyan-400/70 font-mono italic mb-4 pr-36">
                    {diagnosis.signature}
                </p>
            )}

            <p className="text-lg text-[#bbc9cf] mb-6 leading-relaxed">
                {description}
            </p>

            <div className="mb-6 flex-1 overflow-y-auto min-h-0">
                <button
                    onClick={() => setFeaturesOpen(!featuresOpen)}
                    className="flex items-center justify-between w-full border-b border-[#3c494e]/30 pb-2 mb-3 text-[#a8e8ff] hover:text-[#00d4ff] transition-colors"
                >
                    <span className="font-mono text-base uppercase tracking-widest">Case Metadata</span>
                    <span
                        className="material-symbols-outlined transition-transform duration-200"
                        style={{
                            fontSize: "18px",
                            transform: featuresOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                    >
                        expand_more
                    </span>
                </button>

                <AnimatePresence initial={false}>
                    {featuresOpen && (
                        <>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                Key Features
                            </div>
                            <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2 overflow-hidden mb-4"
                            >
                                {keyFeatures.map((feature, index) => (
                                     <motion.li
                                         key={index}
                                         initial={{ opacity: 0, x: -10 }}
                                         animate={{ opacity: 1, x: 0 }}
                                         transition={{ delay: index * 0.07 }}
                                         className="flex items-start gap-3 text-lg text-[#bbc9cf]"
                                     >
                                        <span className="text-[#a8e8ff] mt-0.5 text-base shrink-0">
                                            ▶
                                        </span>
                                        <span>{feature}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </>
                    )}
                </AnimatePresence>
            </div>

            <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Differential Diagnoses
                </div>
                <div className="flex flex-wrap gap-2">
                    {differentials.map((diff) => (
                        <span
                            key={diff}
                            className="px-3 py-1 bg-[#333538] text-sm text-slate-400 font-mono"
                        >
                            {diff}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DiagnosisCard;
