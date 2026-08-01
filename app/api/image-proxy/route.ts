import { isIP } from "node:net";
import { NextResponse } from "next/server";

const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
function isPrivateHost(host: string) {
  const value = host.toLowerCase();
  if (value === "localhost" || value.endsWith(".localhost") || value.endsWith(".local")) return true;
  if (!isIP(value)) return false;
  return value === "::1" || value.startsWith("127.") || value.startsWith("10.") || value.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(value) || value.startsWith("169.254.");
}

export async function GET(request: Request) {
  const source = new URL(request.url).searchParams.get("url");
  let target: URL;
  try { target = new URL(source ?? ""); } catch { return NextResponse.json({ error: "Invalid image URL." }, { status: 400 }); }
  if (target.protocol !== "https:" || isPrivateHost(target.hostname)) return NextResponse.json({ error: "Unsupported image host." }, { status: 400 });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(target, { signal: controller.signal, redirect: "error", cache: "force-cache" });
    const type = response.headers.get("content-type") ?? "";
    const size = Number(response.headers.get("content-length") ?? 0);
    if (!response.ok || !type.startsWith("image/") || size > MAX_BYTES) return NextResponse.json({ error: "Image unavailable." }, { status: 422 });
    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return NextResponse.json({ error: "Image is too large." }, { status: 422 });
    return new NextResponse(body, { headers: { "Cache-Control": "public, max-age=3600", "Content-Type": type, "X-Content-Type-Options": "nosniff" } });
  } catch { return NextResponse.json({ error: "Image unavailable." }, { status: 502 }); } finally { clearTimeout(timeout); }
}
