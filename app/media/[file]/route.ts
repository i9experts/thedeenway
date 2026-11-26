import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { filePath, MIME_BY_EXT } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Streams uploaded reel videos, with Range support so phones can play and seek.
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const f = await filePath(file);
  if (!f) return new Response("Not found", { status: 404 });
  const type = MIME_BY_EXT[f.ext] ?? "application/octet-stream";
  const common = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=31536000, immutable" };

  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    let start = range[1] ? Number(range[1]) : NaN;
    let end = range[2] ? Number(range[2]) : NaN;
    if (Number.isNaN(start)) {
      start = Math.max(0, f.size - end);
      end = f.size - 1;
    } else if (Number.isNaN(end) || end >= f.size) {
      end = f.size - 1;
    }
    if (start > end || start >= f.size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${f.size}` } });
    const stream = Readable.toWeb(createReadStream(f.full, { start, end })) as ReadableStream;
    return new Response(stream, { status: 206, headers: { ...common, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${f.size}` } });
  }
  const stream = Readable.toWeb(createReadStream(f.full)) as ReadableStream;
  return new Response(stream, { headers: { ...common, "Content-Length": String(f.size) } });
}
