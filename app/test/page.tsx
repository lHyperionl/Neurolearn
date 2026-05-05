"use client";

import Link from "next/link";

export default function TestChooser() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="font-syne text-2xl mb-6">Test Yourself</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/test/regular"
          className="block p-6 bg-[#0f1315] border border-[#2b3538] hover:shadow-lg transition-shadow"
        >
          <div className="font-bold text-lg">Regular Test</div>
          <div className="text-sm text-slate-400 mt-2">
            Start a randomized test.
          </div>
        </Link>

        <Link
          href="/test/list"
          className="block p-6 bg-[#0f1315] border border-[#2b3538] hover:shadow-lg transition-shadow"
        >
          <div className="font-bold text-lg">Browse Tests</div>
          <div className="text-sm text-slate-400 mt-2">
            View and take one of predefined tests.
          </div>
        </Link>
      </div>
    </div>
  );
}
