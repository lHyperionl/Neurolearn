"use client";

import { useState, useEffect } from "react";

interface AnswerInput {
  label: "A" | "B" | "C" | "D";
  text: string;
  is_correct: boolean;
}

interface QuestionInput {
  participant_id: string;
  text: string;
  answers: AnswerInput[];
}

export default function CreateTestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // fetch participants for mapping questions (optional)
    fetch("http://127.0.0.1:8000/participants/all")
      .then((r) => r.json())
      .then((data) => setParticipants(data || []))
      .catch(() => setParticipants([]));
  }, []);

  const newEmptyQuestion = (): QuestionInput => ({
    participant_id: participants[0] || "",
    text: "",
    answers: [
      { label: "A", text: "", is_correct: false },
      { label: "B", text: "", is_correct: false },
      { label: "C", text: "", is_correct: false },
      { label: "D", text: "", is_correct: false },
    ],
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
    if (err) return alert(err);

    const payload = {
      title,
      description,
      questions: questions.map((q) => ({
        participant_id: q.participant_id,
        text: q.text,
        answers: q.answers.map((a) => ({
          label: a.label,
          text: a.text,
          is_correct: a.is_correct,
        })),
      })),
    };

    try {
      setSaving(true);
      const res = await fetch("http://127.0.0.1:8000/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create test");
      alert("Test created");
      // reset
      setTitle("");
      setDescription("");
      setQuestions([]);
    } catch (e: any) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="bg-[#1e2023] border border-[#3c494e] p-6">
        <h1 className="font-syne text-2xl mb-2">Create Test</h1>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Test title"
            className="w-full p-3 bg-[#0f1315] border border-[#2b3538]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="w-full p-3 bg-[#0f1315] border border-[#2b3538]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="bg-[#121314] border border-[#2b3538] p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="font-bold">Question {qi + 1}</div>
              <div className="flex gap-2">
                <select
                  value={q.participant_id}
                  onChange={(e) =>
                    updateQuestion(qi, { participant_id: e.target.value })
                  }
                  className="bg-[#0f1315] border border-[#2b3538] p-2"
                >
                  <option value="">Select participant</option>
                  {participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeQuestion(qi)}
                  className="bg-[#ff6b6b] px-3 py-1"
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="Question text"
              className="w-full p-2 mb-3 bg-[#0f1315] border border-[#2b3538]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {q.answers.map((a, ai) => (
                <div key={a.label} className="flex items-start gap-2">
                  <label className="w-6">{a.label}</label>
                  <input
                    value={a.text}
                    onChange={(e) =>
                      updateAnswer(qi, ai, { text: e.target.value })
                    }
                    placeholder={`Answer ${a.label}`}
                    className="flex-1 p-2 bg-[#0f1315] border border-[#2b3538]"
                  />
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={a.is_correct}
                    onChange={() => markCorrect(qi, ai)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={addQuestion} className="bg-[#a8e8ff] px-4 py-2">
          Add Question
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-[#00d4ff] px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Test"}
        </button>
      </div>
    </div>
  );
}
