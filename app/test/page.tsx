"use client";

import { useState } from "react";
import ProgressBar from "@/components/test/ProgressBar";
import QuestionCard from "@/components/test/QuestionCard";
import ResultsSummary from "@/components/test/ResultsSummary";
import { questions } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

export default function TestPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsFinished(false);
    };

    return (
        <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-64px)] flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-12">
                {!isFinished && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ProgressBar
                            current={currentQuestionIndex + 1}
                            total={questions.length}
                        />
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {!isFinished ? (
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            <QuestionCard
                                question={questions[currentQuestionIndex]}
                                onAnswer={handleAnswer}
                                onNext={handleNext}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <ResultsSummary
                                score={score}
                                total={questions.length}
                                onReset={handleReset}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
