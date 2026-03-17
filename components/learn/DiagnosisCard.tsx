"use client";

import { Diagnosis } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface DiagnosisCardProps {
    diagnosis: Diagnosis;
}

const DiagnosisCard = ({ diagnosis }: DiagnosisCardProps) => {
    return (
        <div className="flex flex-col gap-6 p-6 rounded-xl border border-cyan-500/20 bg-[#0f1117] shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 blur-[100px] rounded-full" />

            <div className="space-y-4">
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-bold font-syne text-white glow-text"
                >
                    {diagnosis.name}
                </motion.h2>

                <div className="flex flex-wrap gap-2">
                    {diagnosis.grade && (
                        <Badge
                            variant="outline"
                            className="border-amber-500/50 text-amber-500 bg-amber-500/5 font-mono"
                        >
                            {diagnosis.grade}
                        </Badge>
                    )}
                    {diagnosis.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono text-[10px]"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                <p className="text-slate-400 leading-relaxed text-sm">
                    {diagnosis.description}
                </p>
            </div>

            <Accordion className="w-full">
                <AccordionItem value="features" className="border-cyan-500/10">
                    <AccordionTrigger className="text-cyan-400 hover:text-cyan-300 font-mono text-xs uppercase tracking-wider">
                        Key Features on MRI
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-3 pt-2">
                            {diagnosis.keyFeatures.map((feature, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 text-sm text-slate-300"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3" />
                    Differential Diagnoses
                </h4>
                <div className="flex flex-wrap gap-2">
                    {diagnosis.differentials.map((diff) => (
                        <button
                            key={diff}
                            className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 text-xs text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer"
                        >
                            {diff}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DiagnosisCard;
