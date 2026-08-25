'use client';

import React from 'react';

interface QuestionFormProps {
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const PRESET_TOPICS = [
  'What is a Python list?',
  'Explain Big O notation in simple terms',
  'How does DNS lookup work step by step?',
  'Difference between SQL and NoSQL databases',
];

export function QuestionForm({
  question,
  setQuestion,
  onSubmit,
  isLoading,
}: QuestionFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && question.trim()) {
        onSubmit(e);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-5 transition-all">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              htmlFor="study-question"
              className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              What would you like to learn today?
            </label>
            <span className="text-xs text-zinc-400">
              {question.length}/2000
            </span>
          </div>
          <div className="relative">
            <textarea
              id="study-question"
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 2000))}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="E.g., What is a Python list? How do binary search trees work?"
              className="w-full px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-y disabled:opacity-60 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Preset prompts for quick study questions */}
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2">
            Sample topics to explore:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                disabled={isLoading}
                onClick={() => setQuestion(topic)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-all disabled:opacity-50 text-left"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-[10px] font-mono">Enter</kbd> to submit
          </span>

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="ml-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-98"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Ask AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
