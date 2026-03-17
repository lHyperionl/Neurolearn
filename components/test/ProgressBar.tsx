"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
    return (
        <div className="w-full space-y-3">
            <div className="flex justify-between items-end">
                <span className="font-syne text-sm font-bold text-white uppercase tracking-wider">
                    Assessment in Progress
                </span>
                <span className="font-mono text-xs text-cyan-400">
                    Question{" "}
                    <span className="text-lg font-bold">{current}</span> of{" "}
                    {total}
                </span>
            </div>

            <div className="flex gap-1.5 h-2 w-full">
                {Array.from({ length: total }).map((_, i) => {
                    const index = i + 1;
                    const isCompleted = index < current;
                    const isCurrent = index === current;

                    return (
                        <div
                            key={i}
                            className={cn(
                                "flex-1 rounded-full transition-all duration-500",
                                isCompleted
                                    ? "bg-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.5)]"
                                    : isCurrent
                                      ? "bg-amber-500 animate-pulse"
                                      : "bg-slate-800",
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
