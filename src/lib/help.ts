import { SERVER } from './config';

// Sends a question to the server and returns the answer, or null if it could not be reached.
export async function askHelp(question: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${SERVER}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.answer || null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
