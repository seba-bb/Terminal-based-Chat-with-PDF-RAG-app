import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main>
      <Card className="mx-auto max-w-3xl space-y-6 p-8 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Phase 3</p>
        <h1 className="font-[var(--font-heading)] text-4xl leading-tight md:text-6xl">
          Split frontend + backend architecture for Chat with PDF
        </h1>
        <p className="max-w-2xl text-slate-700">
          Upload a PDF to the FastAPI backend, get a document ID, then ask questions against indexed chunks.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/upload">
            <Button>Go to Upload</Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline">Go to Chat</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
