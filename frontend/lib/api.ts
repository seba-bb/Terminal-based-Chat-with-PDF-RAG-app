const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export type UploadResponse = {
  doc_id: string;
  filename: string;
  chunks_indexed: number;
};

export type ChatRequest = {
  doc_id: string;
  question: string;
  k?: number;
  chat_model?: string;
};

export type ChatResponse = {
  answer: string;
  sources: string[];
};

function apiErrorPrefix(status: number) {
  return `Request failed (${status})`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: string };
    if (data.detail) {
      return data.detail;
    }
  } catch {
    // No JSON response; use fallback text.
  }
  return apiErrorPrefix(response.status);
}

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as UploadResponse;
}

export async function chatWithPdf(payload: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as ChatResponse;
}

export async function getHealthStatus(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(apiErrorPrefix(response.status));
  }
  const data = (await response.json()) as { status: string };
  return data.status;
}
