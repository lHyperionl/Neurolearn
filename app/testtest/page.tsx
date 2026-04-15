"use client";

import { useEffect, useState } from "react";
import MRITestViewer from "@/components/test/MRITestViewer";

export default function TestPage() {
  const [allCases, setAllCases] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const questionCount = 10;

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 relative">
      {currentQuestion && !isFinished && (
        <>
          <MRITestViewer
            key={currentQuestion.participant_id}
            participant_id={currentQuestion.participant_id}
          />

          <div className="font-mono text-xs text-[#bbc9cf] flex gap-6">
            <span>Score: {score}</span>
            <span>Subject: {currentQuestion.participant_id}</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
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
                  <span className="font-bold text-sm">{value}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!answered}
            className="
              w-full md:w-auto
              mt-6
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
        </>
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
