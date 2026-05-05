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
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="font-syne text-2xl">All Tests</h1>
      <div className="space-y-4">
        {tests.map((t) => (
          <div
            key={t.test_id}
            className="bg-[#121314] border border-[#2b3538] p-4"
          >
            <div className="mb-3">
              <div className="font-bold">{t.title}</div>
              {t.description && (
                <div className="text-sm text-slate-400">{t.description}</div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href={`/test/take/${t.test_id}`}
                className="inline-block px-4 py-2 bg-[#a8e8ff] text-[#003642] font-bold"
              >
                Take Test
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
