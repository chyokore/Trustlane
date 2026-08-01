import { NextResponse } from "next/server";
import { resolveProductImage } from "@/services/product-images";

const recent = new Map<string, number>();
const pending = new Map<string, Promise<Response>>();
function dev(label: string, detail: unknown) { if (process.env.NODE_ENV !== "production") console.info(`[TrustLane images] ${label}`, detail); }

export async function POST(request: Request) {
  let body: { title?: unknown; brand?: unknown; merchant?: unknown };
  try { body = await request.json() as { title?: unknown; brand?: unknown; merchant?: unknown }; } catch { return NextResponse.json({ error: "Invalid image request." }, { status: 400 }); }
  if (typeof body.title !== "string" || !body.title.trim() || body.title.length > 160 || (body.brand !== undefined && (typeof body.brand !== "string" || body.brand.length > 120)) || (body.merchant !== undefined && (typeof body.merchant !== "string" || body.merchant.length > 120))) return NextResponse.json({ error: "Invalid product image request." }, { status: 400 });
  const title = body.title;
  const brand = body.brand;
  const merchant = body.merchant;
  const key = `${title}|${brand ?? ""}|${merchant ?? ""}`.toLowerCase();
  const last = recent.get(key);
  if (last && Date.now() - last < 500) return NextResponse.json({ error: "Image lookup is already in progress." }, { status: 429 });
  const shared = pending.get(key);
  if (shared) return (await shared).clone();
  const work = (async () => {
    recent.set(key, Date.now());
    const image = await resolveProductImage({ title: title.trim(), brand: typeof brand === "string" ? brand : undefined, merchant: typeof merchant === "string" ? merchant : undefined });
    dev("API response", { found: Boolean(image), titleLength: title.length });
    return image ? NextResponse.json({ image }) : NextResponse.json({ image: null, message: "Product image temporarily unavailable." }, { status: 404 });
  })();
  pending.set(key, work);
  try { return await work; } finally { pending.delete(key); }
}
