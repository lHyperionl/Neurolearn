"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MRITestViewer from "@/components/test/MRITestViewer";

interface TestAnswer {
  answer_id: number;
  text: string;
  is_correct: boolean;
}

export default function TakeTestPage() {
  const params = useParams();
  const testId = params?.testId;

  const [test, setTest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!testId) return;
    const fetchTest = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/tests/${testId}`);
        if (!res.ok) throw new Error(`Failed to fetch test: ${res.status}`);
        const data = await res.json();
        // Ensure every question has a nifti_url; fetch from participant endpoint when missing
        const qs = data.questions || [];
        await Promise.all(
          qs.map(async (qq: any) => {
            if (!qq.nifti_url) {
              try {
                const r = await fetch(
                  `http://127.0.0.1:8000/participants/${qq.participant_id}/nifti`,
                );
                if (!r.ok) return;
                const jd = await r.json();
                if (jd && jd.nifti_url) qq.nifti_url = jd.nifti_url;
              } catch (err) {
                // ignore missing image
              }
            }
          }),
        );

        setTest(data);
      } catch (e: any) {
        setError(e.message || "Error fetching test");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  useEffect(() => {
    // reset when test changes
    setIndex(0);
    setAnswered(false);
    setSelectedAnswerId(null);
    setScore(0);
    setIsFinished(false);
  }, [test]);

  if (loading) return <div className="p-6">Loading test…</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!test) return <div className="p-6">Test not found.</div>;

  const questions = test.questions || [];
  if (questions.length === 0)
    return <div className="p-6">No questions in this test.</div>;

  const q = questions[index];

  const totalQuestions = questions.length;
  const completed = Math.min(index + (answered ? 1 : 0), totalQuestions);
  const progressPercent = Math.round((completed / totalQuestions) * 100);

  const handleAnswer = (answer: TestAnswer) => {
    if (answered) return;
    setSelectedAnswerId(answer.answer_id);
    if (answer.is_correct) setScore((s) => s + 1);
    setAnswered(true);
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setAnswered(false);
      setSelectedAnswerId(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setAnswered(false);
    setSelectedAnswerId(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="w-[80vw] max-w-[80vw] mx-auto space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="font-syne text-2xl">{test.title}</h1>
        <Link href="/test/list" className="text-sm text-slate-400">
          Back to tests
        </Link>
      </div>

      {!isFinished && (
        <div className="sticky top-0 z-40 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 items-stretch">
            <div className="bg-[#1e2023]/90 backdrop-blur-sm border border-[#3c494e] p-3">
              <div className="flex items-center justify-between mb-2 font-mono text-[13px] md:text-[14px] uppercase tracking-wider text-[#bbc9cf]">
                <span>Test Progress</span>
                <span>
                  {completed}/{totalQuestions} ({progressPercent}%)
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
              <span className="font-mono text-[13px] md:text-[14px] uppercase tracking-wider text-[#bbc9cf] whitespace-nowrap">
                Current Score
              </span>
              <span className="font-syne text-2xl md:text-3xl font-extrabold text-[#a8e8ff] glow-text leading-none shrink-0 text-right tabular-nums">
                {score}
              </span>
            </div>
          </div>
        </div>
      )}

      {q && !isFinished && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-6 lg:items-stretch">
          <div className="min-w-0">
            {q.nifti_url ? (
              <MRITestViewer
                key={q.participant_id}
                participant_id={q.participant_id}
                url={q.nifti_url}
              />
            ) : (
              <div className="bg-[#0f1315] border border-[#2b3538] p-6">
                No image available for this question.
              </div>
            )}
          </div>

          <div className="min-w-0 lg:h-[70vh] lg:min-h-[560px] flex flex-col">
            <div className="bg-[#1e2023] border border-[#3c494e] px-5 py-4 shrink-0">
              <div className="font-mono text-[13px] uppercase tracking-wider text-[#bbc9cf] mb-2">
                Question
              </div>
              <div className="font-syne text-lg md:text-xl font-semibold text-[#e2e2e6] leading-snug">
                {q.text}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 pt-4">
              <div className="grid grid-cols-1 gap-3 flex-1 content-start">
                {q.answers.map((a: TestAnswer) => {
                  const isSelected = selectedAnswerId === a.answer_id;
                  let base =
                    "group p-4 flex flex-col text-left transition-all border-l-2 font-syne uppercase tracking-wide";
                  let style =
                    "bg-[#1e2023] hover:bg-[#282a2d] border-transparent text-[#e2e2e6]";

                  if (answered) {
                    if (a.is_correct) {
                      style = "bg-[#333538] border-[#a8e8ff] text-[#00d4ff]";
                    } else if (isSelected) {
                      style = "bg-[#3a1f1f] border-[#ff6b6b] text-[#ff6b6b]";
                    } else {
                      style = "bg-[#1e2023] opacity-50 border-transparent";
                    }
                  }

                  return (
                    <button
                      key={a.answer_id}
                      disabled={answered}
                      onClick={() => handleAnswer(a)}
                      className={`${base} ${style}`}
                    >
                      <span className="font-bold text-sm">{a.text}</span>
                    </button>
                  );
                })}

                {answered && (
                  <div className="mt-3 p-3 rounded border border-[#3c494e] bg-[#151617] text-sm text-[#e2e2e6]">
                    {q.answers.find(
                      (x: TestAnswer) =>
                        x.answer_id === (selectedAnswerId ?? 0),
                    )?.is_correct ? (
                      <div>
                        <span className="font-bold text-[#a8e8ff]">
                          Correct
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-bold text-[#ff6b6b]">Wrong</span>
                        <div className="mt-2">
                          Correct answer:{" "}
                          {
                            q.answers.find((x: TestAnswer) => x.is_correct)
                              ?.text
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={!answered}
                className="w-full mt-auto bg-[#a8e8ff] text-[#003642] px-10 py-4 font-syne font-extrabold uppercase text-xs tracking-widest disabled:opacity-40 hover:brightness-110 transition-all shadow-[0_0_30px_rgba(168,232,255,0.2)]"
              >
                {index === questions.length - 1 ? "SHOW RESULT" : "NEXT"}
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
                className="bg-[#a8e8ff] text-[#003642] px-6 py-3 font-syne font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all"
              >
                Restart
              </button>
              <Link
                href="/test/list"
                className="bg-[#333538] text-[#e2e2e6] px-6 py-3 font-syne font-bold uppercase text-xs tracking-widest hover:bg-[#44474a] transition-all"
              >
                Back to tests
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
