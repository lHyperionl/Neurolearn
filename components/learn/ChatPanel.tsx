"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, initialChatMessages } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ChatPanel = () => {
    const [messages, setMessages] =
        useState<ChatMessage[]>(initialChatMessages);
    const [inputValue, setInputValue] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "student",
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue("");
        setIsThinking(true);

        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content:
                    "I acknowledge your query. In the active diagnostic mode, notice how the pathological findings suggest rapid cellular division consistent with the primary diagnosis.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsThinking(false);
        }, 1500);
    };

    return (
        <div className="bg-[#1a1c1f] border border-[#3c494e] flex-1 flex flex-col overflow-hidden min-h-[400px]">
            {/* Header */}
            <div className="p-4 border-b border-[#3c494e]/30 flex items-center justify-between bg-[#282a2d]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00d4ff]/20 flex items-center justify-center border border-[#00d4ff]/50">
                        <span
                            className="material-symbols-outlined text-[#a8e8ff]"
                            style={{ fontSize: "16px" }}
                        >
                            auto_awesome
                        </span>
                    </div>
                    <div>
                        <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-[#e2e2e6]">
                            Study Assistant
                        </h4>
                        <p className="text-[9px] text-[#a8e8ff] font-mono">
                            NEURAL_MODEL: ON_LINE
                        </p>
                    </div>
                </div>
                <span
                    className="material-symbols-outlined text-slate-500"
                    style={{ fontSize: "18px" }}
                >
                    more_vert
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex flex-col",
                                msg.role === "student"
                                    ? "items-end"
                                    : "items-start",
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 max-w-[90%]",
                                    msg.role === "student"
                                        ? "bg-[#333538] border-r-2 border-[#00d4ff]/40"
                                        : "bg-[#00d4ff]/5 border-l-2 border-[#a8e8ff]",
                                )}
                            >
                                <p
                                    className={cn(
                                        "text-xs leading-relaxed",
                                        msg.role === "student"
                                            ? "text-[#e2e2e6]"
                                            : "text-[#bbc9cf]",
                                    )}
                                >
                                    {msg.content}
                                </p>
                            </div>
                            <span
                                suppressHydrationWarning
                                className={cn(
                                    "text-[9px] font-mono mt-1",
                                    msg.role === "student"
                                        ? "text-slate-500"
                                        : "text-[#a8e8ff]",
                                )}
                            >
                                {msg.role === "student"
                                    ? "STUDENT_01"
                                    : "CORE_AI"}{" "}
                                [
                                {msg.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                })}
                                ]
                            </span>
                        </motion.div>
                    ))}

                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-start"
                        >
                            <div className="bg-[#00d4ff]/5 p-3 max-w-[90%] border-l-2 border-[#a8e8ff] flex items-center gap-2">
                                <span
                                    className="material-symbols-outlined text-[#a8e8ff] animate-spin"
                                    style={{ fontSize: "14px" }}
                                >
                                    autorenew
                                </span>
                                <span className="text-xs text-[#bbc9cf] font-mono">
                                    Processing...
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-[#3c494e]/30">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="QUERY_NEURAL_DATABASE..."
                        className="flex-1 bg-transparent border-b border-[#3c494e] focus:border-[#a8e8ff] focus:ring-0 text-xs font-mono py-2 placeholder:text-slate-600 outline-none text-[#e2e2e6]"
                        type="text"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isThinking}
                        className="bg-[#00d4ff] text-[#00586b] p-2 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                        >
                            send
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
