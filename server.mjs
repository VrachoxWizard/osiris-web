import { createReadStream } from "node:fs";
import { stat, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { renderPage } from './scripts/render-page.mjs';
const projectRoot = dirname(fileURLToPath(import.meta.url));
const built = process.argv.includes('--built');
const root = built ? join(projectRoot, 'dist') : projectRoot;
const port = Number.parseInt(process.env.PORT ?? "4173", 10);

const mimeTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const route = decoded === "/" ? "/index.html" : decoded;
  const withIndex = route.endsWith("/") ? `${route}index.html` : route;
  const candidate = normalize(join(root, withIndex));

  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    return null;
  }

  return candidate;
}

const server = createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method Not Allowed");
    return;
  }

  let filePath;
  try {
    filePath = safePath(request.url);
  } catch {
    filePath = null;
  }

  if (!filePath) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad Request");
    return;
  }

  try {
    let fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = join(filePath, "index.html");
      fileStat = await stat(filePath);
    }

    if (!fileStat.isFile()) throw new Error("Not a file");

    if (extname(filePath) === '.html') {
      const source = await readFile(filePath, 'utf8');
      const html = built ? source : renderPage(source, request.url);
      response.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Content-Length':Buffer.byteLength(html),'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
      response.end(request.method === 'HEAD' ? undefined : html);
      return;
    }
    const contentType = mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream";
    response.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": fileStat.size,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch {
    const source = await readFile(join(root, '404.html'), 'utf8');
    const notFound = built ? source : renderPage(source, '/404.html');
    response.writeHead(404, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": Buffer.byteLength(notFound),
      "Cache-Control": "no-cache",
    });
    response.end(request.method === "HEAD" ? undefined : notFound);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`OSIRIS je dostupan na http://localhost:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
