"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatWithPdf } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

export default function ChatPage() {
  const [docId, setDocId] = useState("");
  const [filename, setFilename] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryDocId = params.get("docId");
    const queryFilename = params.get("filename");

    if (queryDocId) {
      setDocId(queryDocId);
      setFilename(queryFilename ?? "");
      return;
    }

    const lastUploadRaw = localStorage.getItem("chatpdf:lastUpload");
    if (!lastUploadRaw) {
      return;
    }

    try {
      const parsed = JSON.parse(lastUploadRaw) as { docId?: string; filename?: string };
      if (parsed.docId) {
        setDocId(parsed.docId);
      }
      if (parsed.filename) {
        setFilename(parsed.filename);
      }
    } catch {
      // Ignore malformed local storage values.
    }
  }, []);

  const ask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!docId.trim()) {
      setError("doc_id is required. Upload a file first or paste it below.");
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    setError(null);
    setLoading(true);

    const userMessage: Message = { role: "user", content: trimmedQuestion };
    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");

    try {
      const response = await chatWithPdf({
        doc_id: docId.trim(),
        question: trimmedQuestion,
        k: 3,
      });

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } catch (chatError) {
      const message = chatError instanceof Error ? chatError.message : "Chat request failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Badge>Chat</Badge>
            <h1 className="font-[var(--font-heading)] text-3xl md:text-4xl">Ask your PDF</h1>
          </div>
          <Link href="/upload">
            <Button variant="outline">Upload Another</Button>
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <Input
            value={docId}
            onChange={(event) => setDocId(event.target.value)}
            placeholder="doc_id from /upload"
          />
          <Input
            value={filename}
            onChange={(event) => setFilename(event.target.value)}
            placeholder="Optional file label"
          />
        </div>

        {filename && <p className="text-sm text-slate-700">Current file: {filename}</p>}
      </Card>

      <Card className="space-y-4">
        <form className="space-y-3" onSubmit={ask}>
          <Textarea
            rows={3}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask something about your document"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Thinking..." : "Ask"}
            </Button>
            {error && <p className="text-sm text-red-700">{error}</p>}
          </div>
        </form>
      </Card>

      <section className="space-y-3">
        {messages.length === 0 && (
          <Card>
            <p className="text-slate-700">No messages yet. Ask your first question.</p>
          </Card>
        )}

        {messages.map((message, index) => (
          <Card
            key={`${message.role}-${index}`}
            className={message.role === "user" ? "border-tide/40 bg-teal-50/70" : "bg-white/90"}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              {message.role}
            </p>
            <p className="whitespace-pre-wrap text-slate-900">{message.content}</p>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Sources</p>
                {message.sources.map((source, sourceIndex) => (
                  <p key={`${sourceIndex}-${source.slice(0, 12)}`} className="text-xs text-slate-700">
                    {sourceIndex + 1}. {source}
                  </p>
                ))}
              </div>
            )}
          </Card>
        ))}
      </section>
    </main>
  );
}
