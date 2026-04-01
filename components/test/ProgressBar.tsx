"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
    return (
        <div className="w-full mb-12">
            <div className="flex justify-between items-end mb-3">
                <span className="font-mono text-xs tracking-tighter text-[#00d4ff]">
                    SESSION_LOG: Q{current}_OF_{total}
                </span>
                <span className="font-mono text-xs text-[#ffb95f]">
                    ESTIMATED_ACCURACY: {Math.max(50, Math.floor((current / (total + 1)) * 100))}%
                </span>
            </div>
            <div className="flex gap-1 h-3 w-full">
                {Array.from({ length: total }).map((_, i) => {
                    const index = i + 1;
                    const isCompleted = index < current;
                    const isCurrent = index === current;

                    return (
                        <div
                            key={i}
                            className={cn(
                                "flex-1",
                                isCompleted
                                    ? "bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                                    : isCurrent
                                      ? "bg-[#ffb95f] shadow-[0_0_8px_rgba(255,185,95,0.4)]"
                                      : "bg-[#333538]"
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
