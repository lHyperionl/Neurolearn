"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestsListPage() {
  const [tests, setTests] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="relative">
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
                    className="inline-block px-4 py-2 bg-[#a8e8ff] text-[#003642] font-bold rounded-md"
                  >
                    Take Test
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}