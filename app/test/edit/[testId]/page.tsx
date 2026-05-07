"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

interface AnswerInput {
  text: string;
  is_correct: boolean;
}

interface QuestionInput {
  participant_id: string;
  text: string;
  answers: AnswerInput[];
  selected_diagnosis?: string;
}

export default function EditTestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [allParticipants, setAllParticipants] = useState<string[]>([]);
  const [diagnoses, setDiagnoses] = useState<
    { diagnosis_id: number; code: string; name: string; signature: string }[]
  >([]);
  const [groupedCases, setGroupedCases] = useState<Record<string, string[]>>(
    {},
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"error" | "success" | null>(
    null,
  );

  // get test id from pathname (last segment)
  const [testId, setTestId] = useState<string | null>(null);

  useEffect(() => {
    const p = window.location.pathname.split("/").filter(Boolean);
    const id = p[p.length - 1];
    setTestId(id || null);
  }, []);

  useEffect(() => {
    // Fetch diagnoses, grouped cases and participants
    const base = "http://127.0.0.1:8000";

    Promise.all([
      fetch(`${base}/diagnoses`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${base}/cases/grouped`).then((r) => (r.ok ? r.json() : {})),
      fetch(`${base}/participants/all`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([diagData, groupedData, parts]) => {
        setDiagnoses(diagData || []);
        setGroupedCases(groupedData || {});
        setAllParticipants(parts || []);
      })
      .catch(() => {
        setDiagnoses([]);
        setGroupedCases({});
        setAllParticipants([]);
      });
  }, []);

  useEffect(() => {
    if (!testId) return;
    const base = "http://127.0.0.1:8000";
    fetch(`${base}/tests/${testId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load test");
        return r.json();
      })
      .then((data) => {
        setTitle(data.title || "");
        setDescription(data.description || "");
        const qs: QuestionInput[] = (data.questions || []).map((q: any) => ({
          participant_id: q.participant_id || "",
          text: q.text || "",
          answers: (q.answers || []).map((a: any) => ({
            text: a.text || "",
            is_correct: !!a.is_correct,
          })),
          selected_diagnosis: "ALL",
        }));
        setQuestions(qs);
      })
      .catch((e) => {
        setMessage(e?.message || "Failed to load test");
        setMessageType("error");
      });
  }, [testId]);

  const newEmptyQuestion = (): QuestionInput => ({
    participant_id: allParticipants[0] || "",
    text: "",
    answers: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
    selected_diagnosis: "ALL",
  });

  const addQuestion = () => setQuestions((q) => [...q, newEmptyQuestion()]);
  const removeQuestion = (idx: number) =>
    setQuestions((q) => q.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, patch: Partial<QuestionInput>) =>
    setQuestions((q) =>
      q.map((qq, i) => (i === idx ? { ...qq, ...patch } : qq)),
    );

  const updateAnswer = (
    qIdx: number,
    aIdx: number,
    patch: Partial<AnswerInput>,
  ) => {
    setQuestions((q) =>
      q.map((qq, i) => {
        if (i !== qIdx) return qq;
        const answers = qq.answers.map((a, j) =>
          j === aIdx ? { ...a, ...patch } : a,
        );
        return { ...qq, answers };
      }),
    );
  };

  const markCorrect = (qIdx: number, aIdx: number) =>
    setQuestions((q) =>
      q.map((qq, i) => {
        if (i !== qIdx) return qq;
        const answers = qq.answers.map((a, j) => ({
          ...a,
          is_correct: j === aIdx,
        }));
        return { ...qq, answers };
      }),
    );

  const validate = () => {
    if (!title.trim()) return "Test title is required";
    if (questions.length === 0) return "Add at least one question";
    for (const [i, q] of questions.entries()) {
      if (!q.participant_id) return `Question ${i + 1}: participant required`;
      if (!q.text.trim()) return `Question ${i + 1}: text required`;
      if (q.answers.length !== 4)
        return `Question ${i + 1}: must have 4 answers`;
      const correct = q.answers.filter((a) => a.is_correct);
      if (correct.length !== 1)
        return `Question ${i + 1}: mark exactly one correct answer`;
      for (const a of q.answers)
        if (!a.text.trim())
          return `Question ${i + 1}: all answers must have text`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setMessage(err);
      setMessageType("error");
      return;
    }
    if (!testId) {
      setMessage("Missing test id");
      setMessageType("error");
      return;
    }

    const payload = {
      title,
      description,
      questions: questions.map((q) => ({
        participant_id: q.participant_id,
        text: q.text,
        answers: q.answers.map((a) => ({
          text: a.text,
          is_correct: a.is_correct,
        })),
      })),
    };

    try {
      setSaving(true);
      const res = await fetch(`http://127.0.0.1:8000/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update test");
      setMessage("Test updated");
      setMessageType("success");
    } catch (e: any) {
      setMessage(e?.message || "Error");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#0c0e11]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-32 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
          <div className="absolute top-1/3 -left-20 w-48 h-48 bg-amber-500/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#2a2f35_1px,transparent_1px),linear-gradient(to_bottom,#2a2f35_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 max-w-4xl mx-auto px-6 py-10"
        >
          <div className="flex items-center justify-between gap-6 mb-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">
                Admin
              </div>
              <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">
                Edit Test
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Modify a saved test.
              </p>
            </div>
          </div>

          <div className="border border-[#3c494e] bg-[#14171c]/80 p-6 rounded-md">
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Test title"
                className="w-full p-3 bg-[#0f1315] border border-[#2b3538] rounded-md"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full p-3 bg-[#0f1315] border border-[#2b3538] rounded-md"
              />
            </div>
          </div>

          <div className="space-y-6 mt-6">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="border border-[#3c494e] bg-[#14171c]/80 p-6 rounded-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold">Question {qi + 1}</div>
                    <div className="text-sm text-slate-400">
                      Map this question to a participant
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="bg-transparent border border-[#ff6b6b] text-[#ff6b6b] px-3 py-1 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Question text
                    </label>
                    <input
                      value={q.text}
                      onChange={(e) =>
                        updateQuestion(qi, { text: e.target.value })
                      }
                      placeholder="Question text"
                      className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Diagnosis
                      </label>
                      <select
                        value={q.selected_diagnosis ?? "ALL"}
                        onChange={(e) => {
                          const val = e.target.value;
                          const filtered =
                            val === "ALL"
                              ? allParticipants
                              : groupedCases[val] || [];
                          updateQuestion(qi, {
                            selected_diagnosis: val,
                            participant_id: filtered[0] || "",
                          });
                        }}
                        className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
                      >
                        <option value="ALL">All diagnoses</option>
                        {diagnoses.map((d) => (
                          <option
                            key={d.diagnosis_id}
                            value={d.code}
                          >
                            {d.code} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Participant
                      </label>
                      <select
                        value={q.participant_id}
                        onChange={(e) =>
                          updateQuestion(qi, { participant_id: e.target.value })
                        }
                        className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
                      >
                        <option value="">Select</option>
                        {(q.selected_diagnosis === "ALL"
                          ? allParticipants
                          : groupedCases[q.selected_diagnosis || ""] || []
                        ).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.answers.map((a, ai) => (
                    <div key={ai}>
                      <label className="block text-xs text-slate-400 mb-1">
                        Answer {String.fromCharCode(65 + ai)}
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          value={a.text}
                          onChange={(e) =>
                            updateAnswer(qi, ai, { text: e.target.value })
                          }
                          placeholder={`Answer ${String.fromCharCode(65 + ai)}`}
                          className="block w-full text-sm text-slate-200 bg-[#0b0c0f] border border-slate-700 rounded-md p-2"
                        />
                        <label className="flex items-center gap-2 text-sm text-slate-200">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={a.is_correct}
                            onChange={() => markCorrect(qi, ai)}
                          />
                          <span className="text-xs text-slate-400">
                            Correct
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {message && (
            <div className="w-full mb-4">
              <div
                className={`w-full p-3 rounded-md text-sm ${messageType === "error" ? "bg-[#2b0f10] text-[#ffb3b3] border border-[#4b1b1c]" : "bg-[#0b2b25] text-[#baf3de] border border-[#114036]"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>{message}</div>
                  <button
                    onClick={() => {
                      setMessage(null);
                      setMessageType(null);
                    }}
                    className="text-xs opacity-80"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div>
              <button
                onClick={addQuestion}
                className="bg-[#a8e8ff] text-[#003642] px-4 py-2 rounded-md font-bold"
              >
                Add Question
              </button>
            </div>
            <div>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#00d4ff] disabled:opacity-50 text-[#002022] px-5 py-2 rounded-md font-bold"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
