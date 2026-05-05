"use client";

import Link from "next/link";
import Sidebar from "@/components/nav/Sidebar";
import { motion } from "framer-motion";

export default function TestChooser() {
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 max-w-4xl mx-auto px-6 py-12"
        >
          <div className="mb-6">
            <div className="font-mono text-xs uppercase tracking-[0.45em] text-cyan-300/70">Tests</div>
            <h1 className="font-syne text-4xl font-extrabold text-[#e2e2e6] tracking-tight mt-2">Test Yourself</h1>
            <p className="text-sm text-slate-400 mt-2">Choose between a randomized practice run or take a previously saved test.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/test/regular"
              className="block p-6 bg-[#14171c]/80 border border-[#3c494e] rounded-md hover:shadow-lg transition-shadow"
            >
              <div className="font-bold text-lg">Regular Test</div>
              <div className="text-sm text-slate-400 mt-2">Start a randomized test that presents cases and answer choices drawn from the dataset.</div>
            </Link>

            <Link
              href="/test/list"
              className="block p-6 bg-[#14171c]/80 border border-[#3c494e] rounded-md hover:shadow-lg transition-shadow"
            >
              <div className="font-bold text-lg">Browse Tests</div>
              <div className="text-sm text-slate-400 mt-2">View, edit or take saved tests that map questions to specific participants.</div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}