import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.FRONTEND_PORT ?? 5173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

http.createServer((req, res) => {
  const requested = new URL(req.url, `http://${req.headers.host}`).pathname;
  const filePath = path.join(root, requested === "/" ? "index.html" : requested);
  const safePath = filePath.startsWith(root) ? filePath : path.join(root, "index.html");

  fs.readFile(safePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(root, "index.html"), (_, fallback) => {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(fallback);
      });
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(safePath)] ?? "text/plain; charset=utf-8" });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`Frontend listening on http://localhost:${port}`);
});
