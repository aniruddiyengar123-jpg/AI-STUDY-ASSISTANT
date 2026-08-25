'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { QuestionForm } from '@/components/QuestionForm';
import { AnswerCard } from '@/components/AnswerCard';
import { ErrorMessage } from '@/components/ErrorMessage';
import { askQuestion, checkApiHealth, ApiClientError } from '@/lib/api';
import { AskResponse } from '@/types';

export default function HomePage() {
  const [question, setQuestion] = useState<string>('');
  const [submittedQuestion, setSubmittedQuestion] = useState<string>('');
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Check backend health on load
  useEffect(() => {
    let mounted = true;
    async function verifyHealth() {
      try {
        await checkApiHealth();
        if (mounted) setBackendHealthy(true);
      } catch {
        if (mounted) setBackendHealthy(false);
      }
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSubmittedQuestion(trimmed);

    try {
      const res = await askQuestion(trimmed);
      setResponse(res);
      setBackendHealthy(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while communicating with the server.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (submittedQuestion) {
      setQuestion(submittedQuestion);
      handleAsk();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white">
      <Header backendHealthy={backendHealthy} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Intro banner */}
        <section className="text-center py-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Learn Anything Faster with AI
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Ask any academic, programming, or conceptual question to get structured explanations, analogies, and practical examples.
          </p>
        </section>

        {/* Input Form */}
        <section>
          <QuestionForm
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleAsk}
            isLoading={isLoading}
          />
        </section>

        {/* Error Message */}
        {error && (
          <section>
            <ErrorMessage
              message={error}
              onRetry={submittedQuestion ? handleRetry : undefined}
              onDismiss={() => setError(null)}
            />
          </section>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Generating comprehensive study guide...
              </span>
            </div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            <div className="h-20 bg-zinc-100 dark:bg-zinc-950/60 rounded-xl w-full" />
          </section>
        )}

        {/* Answer Card */}
        {response && !isLoading && (
          <section>
            <AnswerCard
              answer={response.answer}
              model={response.model}
              question={submittedQuestion}
            />
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <p>AI Study Assistant V1 &bull; Powered by FastAPI & NVIDIA API</p>
      </footer>
    </div>
  );
}
