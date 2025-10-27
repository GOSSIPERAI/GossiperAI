//import { env } from "@/env.mjs";

/**
 * Fetches the complete transcript data from AssemblyAI API
 * @param transcriptId The ID of the transcript to fetch
 * @returns The complete transcript data
 */
export async function fetchTranscript(transcriptId: string) {
  const response = await fetch(
    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
    {
      headers: {
        "Authorization": process.env.ASSEMBLYAI_API_KEY!,// changed env to process.env plus non-null assertion(!)
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch transcript: ${response.status} ${response.statusText}`,
      { cause: error }
    );
  }

  return response.json();
}