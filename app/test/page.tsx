"use client";

import { useEffect, useState } from "react";
import MRITestViewer from "@/components/test/MRITestViewer";

export default function TestPage() {
  const questionPrompt = "What diagnosis can you see on the MRI?";

  const diagnosisLabelMap: Record<string, string> = {
    CONTROL: "Healthy",
    SCHZ: "Schizophrenia",
    BIPOLAR: "Bipolar disorder",
    ADHD: "ADHD",
  };

  const [allCases, setAllCases] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const questionCount = 10;
  const totalQuestions = Math.min(
    questionCount,
    allCases.length || questionCount,
  );
  const completedQuestions = Math.min(
    question + (answered ? 1 : 0),
    totalQuestions,
  );
  const progressPercent = Math.round(
    (completedQuestions / totalQuestions) * 100,
  );

  useEffect(() => {
    fetch("http://127.0.0.1:8000/questions/qenerate_pids")
      .then((res) => res.json())
      .then((data) => setAllCases(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!allCases.length) return;

      try {
        const res = await fetch(
          `http://127.0.0.1:8000/questions/qenerate/${allCases[question]}`,
        );
        const data = await res.json();
        setCurrentQuestion(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestion();
  }, [allCases, question]);

  const handleAnswer = (value: string, isCorrect: boolean) => {
    if (answered) return;

    setSelectedAnswer(value);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setAnswered(true);
  };

  const handleNext = () => {
    if (question + 1 < Math.min(questionCount, allCases.length)) {
      setQuestion((prev) => prev + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setQuestion(0);
    setIsFinished(false);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const getAnswerLabel = (value: string) => {
    return diagnosisLabelMap[value.toUpperCase()] ?? value;
  };

  return (
    <div className="w-[80vw] max-w-[80vw] mx-auto space-y-6 relative">
      {!isFinished && (
        <div className="sticky top-0 z-40 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 items-stretch">
            <div className="bg-[#1e2023]/90 backdrop-blur-sm border border-[#3c494e] p-3">
              <div className="flex items-center justify-between mb-2 font-mono text-[11px] uppercase tracking-wider text-[#bbc9cf]">
                <span>Test Progress</span>
                <span>
                  {completedQuestions}/{totalQuestions} ({progressPercent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden bg-[#282a2d] border border-[#3c494e]">
                <div
                  className="h-full bg-[#a8e8ff] shadow-[0_0_16px_rgba(168,232,255,0.45)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-[#1e2023]/90 backdrop-blur-sm border border-[#3c494e] px-4 py-4 flex min-w-0 items-center justify-between gap-3 overflow-hidden w-full">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#bbc9cf] whitespace-nowrap">
                Current Score
              </span>
              <span className="font-syne text-2xl md:text-3xl font-extrabold text-[#a8e8ff] glow-text leading-none shrink-0 text-right tabular-nums">
                {score}
              </span>
            </div>
          </div>
        </div>
      )}

      {currentQuestion && !isFinished && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 lg:items-stretch">
          <div className="min-w-0">
            <MRITestViewer
              key={currentQuestion.participant_id}
              participant_id={currentQuestion.participant_id}
            />
          </div>

          <div className="min-w-0 lg:h-[70vh] lg:min-h-[560px] flex flex-col">
            <div className="bg-[#1e2023] border border-[#3c494e] px-5 py-4 shrink-0">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#bbc9cf] mb-2">
                Diagnostic Question
              </div>
              <div className="font-syne text-lg md:text-xl font-semibold text-[#e2e2e6] leading-snug">
                {questionPrompt}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 pt-4">
              <div className="grid grid-cols-1 gap-3 flex-1 content-start">
                {currentQuestion.answers.map((value: string) => {
                  const isCorrect = value === currentQuestion.correct;

                  let base =
                    "group p-4 flex flex-col text-left transition-all border-l-2 font-syne uppercase tracking-wide";

                  let style =
                    "bg-[#1e2023] hover:bg-[#282a2d] border-transparent text-[#e2e2e6]";

                  if (answered) {
                    if (value === currentQuestion.correct) {
                      style =
                        "bg-[#333538] border-[#a8e8ff] text-[#00d4ff] shadow-[0_0_15px_rgba(168,232,255,0.1)]";
                    } else if (value === selectedAnswer) {
                      style =
                        "bg-[#3a1f1f] border-[#ff6b6b] text-[#ff6b6b] shadow-[0_0_10px_rgba(255,107,107,0.2)]";
                    } else {
                      style = "bg-[#1e2023] opacity-50 border-transparent";
                    }
                  }

                  return (
                    <button
                      key={value}
                      disabled={answered}
                      onClick={() => handleAnswer(value, isCorrect)}
                      className={`${base} ${style}`}
                    >
                      <span className="font-bold text-sm">
                        {getAnswerLabel(value)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleNext}
                disabled={!answered}
                className="
                  w-full
                  mt-auto
                  bg-[#a8e8ff]
                  text-[#003642]
                  px-10 py-4
                  font-syne font-extrabold
                  uppercase text-xs tracking-widest
                  disabled:opacity-40
                  hover:brightness-110
                  transition-all
                  shadow-[0_0_30px_rgba(168,232,255,0.2)]
                "
              >
                {question == questionCount - 1 ? "SHOW RESULT" : "NEXT"}
                {/* NEXT */}
              </button>
            </div>
          </div>
        </div>
      )}

      {isFinished && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e2023] p-10 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] text-center space-y-6">
            <div className="text-[#e2e2e6] font-syne text-2xl">Finished!</div>
            <div className="text-[#a8e8ff] font-mono text-lg">
              Final Score: {score}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRestart}
                className="
                  bg-[#a8e8ff]
                  text-[#003642]
                  px-6 py-3
                  font-syne font-bold
                  uppercase text-xs tracking-widest
                  hover:brightness-110
                  transition-all
                "
              >
                Restart
              </button>
              <button
                onClick={() => setIsFinished(false)}
                className="
                  bg-[#333538]
                  text-[#e2e2e6]
                  px-6 py-3
                  font-syne font-bold
                  uppercase text-xs tracking-widest
                  hover:bg-[#44474a]
                  transition-all
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
