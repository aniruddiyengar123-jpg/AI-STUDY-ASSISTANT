'use client';

import React, { useState } from 'react';

interface AnswerCardProps {
  answer: string;
  model: string;
  question: string;
}

export function AnswerCard({ answer, model, question }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // Helper to format basic markdown-like structures (bold, code blocks, lists) cleanly
  const renderFormattedContent = (content: string) => {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        let language = '';
        let codeLines = lines;
        if (lines.length > 0 && lines[0].trim() && !lines[0].includes(' ')) {
          language = lines[0].trim();
          codeLines = lines.slice(1);
        }
        const codeText = codeLines.join('\n');

        return (
          <div key={index} className="my-4 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 text-zinc-100">
            {language && (
              <div className="px-4 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                {language}
              </div>
            )}
            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-emerald-300/90">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format text paragraphs and lists
      const paragraphs = part.split('\n\n');
      return (
        <div key={index} className="space-y-3">
          {paragraphs.map((p, pIdx) => {
            const trimmed = p.trim();
            if (!trimmed) return null;

            // Check if paragraph is a list
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
              const listLines = trimmed.split('\n');
              return (
                <ul key={pIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-emerald-500">
                  {listLines.map((line, lIdx) => {
                    const cleanLine = line.replace(/^[-*]\s+|\d+\.\s+/, '');
                    return (
                      <li key={lIdx} className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {renderInlineFormatting(cleanLine)}
                      </li>
                    );
                  })}
                </ul>
              );
            }

            // Regular paragraph
            return (
              <p key={pIdx} className="text-sm sm:text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                {renderInlineFormatting(trimmed)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const renderInlineFormatting = (text: string) => {
    // Basic inline code & bold formatting
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
            {token.slice(2, -2)}
          </strong>
        );
      }
      return token;
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all animate-fadeIn">
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            AI Explanation
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
            {model}
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-xs"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Answer content */}
      <div className="p-5 sm:p-6">
        <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            Question
          </p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">
            &ldquo;{question}&rdquo;
          </p>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {renderFormattedContent(answer)}
        </div>
      </div>
    </div>
  );
}
