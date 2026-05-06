"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestsListPage() {
  const [tests, setTests] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number[] | null>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<any | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/tests");
        if (!res.ok) throw new Error(`Failed to fetch tests: ${res.status}`);
        const data = await res.json();
        setTests(data);
      } catch (e: any) {
        setError(e.message || "Error fetching tests");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) return <div className="p-6">Loading tests…</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!tests || tests.length === 0)
    return <div className="p-6">No tests found.</div>;

  return (
    <div className="relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-32 w-72 h-72 bg-cyan-500/10 blur-[140px]" />
        <div className="absolute top-1/3 -left-20 w-48 h-48 bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">
            Tests
          </div>
          <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">
            Saved Tests
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Take previously created tests.
          </p>
        </div>

        <div className="space-y-4">
          {tests.map((t) => (
            <div
              key={t.test_id}
              className="bg-[#121314] border border-[#2b3538] p-4 rounded-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-lg">{t.title}</div>
                  {t.description && (
                    <div className="text-sm text-slate-400">
                      {t.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/test/take/${t.test_id}`}
                    className="inline-block px-6 py-3 bg-[#a8e8ff] text-[#003642] font-syne font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all"
                  >
                    Take Test
                  </Link>
                  <Link
                    href={`/test/edit/${t.test_id}`}
                    className="inline-block px-6 py-3 bg-[#003642] text-[#a8e8ff] font-syne font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,54,66,0.12)]"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      setTestToDelete(t);
                      setConfirmOpen(true);
                    }}
                    disabled={!!deleting?.includes(t.test_id)}
                    className="inline-block px-6 py-3 bg-[#ff6b6b] text-white font-syne font-bold uppercase text-xs tracking-widest hover:brightness-105 transition-all shadow-[0_0_20px_rgba(255,107,107,0.15)]"
                  >
                    {deleting?.includes(t.test_id) ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {confirmOpen && testToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setConfirmOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md bg-[#0f1112] border border-[#2b3538] rounded-md p-6">
              <h2 className="text-lg font-bold mb-2">Delete test</h2>
              <p className="text-sm text-slate-400 mb-4">
                Are you sure you want to delete "{testToDelete.title}"?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-[#2b2f31] text-slate-200 font-syne font-bold uppercase text-xs tracking-widest rounded-md hover:brightness-105 transition-all"
                  onClick={() => {
                    setConfirmOpen(false);
                    setTestToDelete(null);
                  }}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 bg-[#ff6b6b] text-white font-syne font-bold uppercase text-xs tracking-widest hover:brightness-105 transition-all shadow-[0_0_20px_rgba(255,107,107,0.15)]"
                  onClick={async () => {
                    if (!testToDelete) return;
                    const id = testToDelete.test_id;
                    try {
                      setDeleting((prev) => (prev ? [...prev, id] : [id]));
                      const res = await fetch(
                        `http://127.0.0.1:8000/tests/${id}`,
                        { method: "DELETE" },
                      );
                      if (!res.ok) {
                        const text = await res.text();
                        throw new Error(
                          text || `Failed to delete test: ${res.status}`,
                        );
                      }
                      setTests((prev) =>
                        prev ? prev.filter((x) => x.test_id !== id) : prev,
                      );
                    } catch (e: any) {
                      setError(e.message || "Failed to delete test");
                    } finally {
                      setDeleting((prev) =>
                        prev ? prev.filter((i) => i !== id) : [],
                      );
                      setConfirmOpen(false);
                      setTestToDelete(null);
                    }
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
