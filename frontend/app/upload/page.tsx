"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { uploadPdf } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Select a PDF first.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await uploadPdf(selectedFile);
      localStorage.setItem(
        "chatpdf:lastUpload",
        JSON.stringify({
          docId: response.doc_id,
          filename: response.filename,
        }),
      );

      const params = new URLSearchParams({
        docId: response.doc_id,
        filename: response.filename,
      });
      router.push(`/chat?${params.toString()}`);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Upload failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card className="space-y-5">
        <div className="space-y-2">
          <Badge>Upload</Badge>
          <h1 className="font-[var(--font-heading)] text-4xl">Index your PDF</h1>
          <p className="text-slate-700">
            This sends your file to `POST /upload`, chunks the text, and stores embeddings in ChromaDB.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block rounded-xl border border-dashed border-slate-400/60 bg-white/70 p-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">PDF file</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-tide file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </label>

          {selectedFile && (
            <p className="text-sm text-slate-700">
              Ready: <span className="font-semibold">{selectedFile.name}</span>
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload and Continue"}
            </Button>
            <Link href="/chat">
              <Button variant="outline">Open Chat</Button>
            </Link>
          </div>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-[var(--font-heading)] text-2xl">Flow</h2>
        <ol className="space-y-3 text-sm text-slate-700">
          <li>1. Choose one PDF file.</li>
          <li>2. Backend stores embeddings in `data/chroma_db`.</li>
          <li>3. You are redirected to chat with the new `doc_id`.</li>
        </ol>
      </Card>
    </main>
  );
}
