import type { Lottery } from "@/lib/lottery"

export async function fetchLotteries(): Promise<Lottery[]> {
  const res = await fetch("/api/lotteries", { cache: "no-store" })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const msg = body?.error ? String(body.error) : `Request failed: ${res.status}`
    throw new Error(msg)
  }
  const json = (await res.json()) as { lotteries: Lottery[] }
  return json.lotteries ?? []
}

