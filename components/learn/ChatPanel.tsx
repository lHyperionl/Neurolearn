"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

        // Mock AI response
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content:
                    "Great question! This feature will be powered by AI in the full version. For now, I can tell you that this specific radiological finding is highly suggestive of the current diagnosis.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsThinking(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full rounded-xl border border-cyan-500/20 bg-[#0f1117] overflow-hidden shadow-xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-cyan-500/10 bg-cyan-500/5">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="font-syne font-bold text-sm text-white">
                    Study Assistant
                </h3>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                        AI Online
                    </span>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-3 max-w-[85%]",
                                msg.role === "student"
                                    ? "ml-auto flex-row-reverse"
                                    : "mr-auto",
                            )}
                        >
                            <div
                                className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                                    msg.role === "ai"
                                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                        : "bg-slate-800 border-slate-700 text-slate-400",
                                )}
                            >
                                {msg.role === "ai" ? (
                                    <Bot className="h-4 w-4" />
                                ) : (
                                    <User className="h-4 w-4" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    "px-3 py-2 rounded-2xl text-sm",
                                    msg.role === "ai"
                                        ? "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                                        : "bg-cyan-600 text-white rounded-tr-none",
                                )}
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}

                    {isThinking && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 mr-auto"
                        >
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="px-3 py-2 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-500 text-sm flex items-center gap-1">
                                Thinking
                                <span className="flex gap-0.5">
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce [animation-delay:0.2s]">
                                        .
                                    </span>
                                    <span className="animate-bounce [animation-delay:0.4s]">
                                        .
                                    </span>
                                </span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-cyan-500/10 bg-black/20">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about this scan..."
                        className="bg-slate-900/50 border-slate-800 focus-visible:ring-cyan-500/50 text-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="bg-cyan-600 hover:bg-cyan-500 text-white shrink-0"
                        disabled={!inputValue.trim() || isThinking}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;
