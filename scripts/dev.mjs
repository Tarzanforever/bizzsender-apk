import { spawn } from "child_process";
import http from "http";
import net from "net";

const PORT = parseInt(process.env.PORT ?? "23035", 10);

async function waitForPortFree(port, maxMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const free = await new Promise((resolve) => {
      const s = net.createServer();
      s.once("error", () => resolve(false));
      s.once("listening", () => { s.close(); resolve(true); });
      s.listen(port, "0.0.0.0");
    });
    if (free) return;
    await new Promise((r) => setTimeout(r, 200));
  }
}

await waitForPortFree(PORT);

// Tiny health-check server so the workflow runner sees the port immediately.
const health = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ok");
});

await new Promise((resolve, reject) => {
  health.once("error", reject);
  health.listen(PORT, "0.0.0.0", resolve);
});
console.log(`[dev] health server on :${PORT}`);

// Expo Metro on the same port — health server hands off after Metro is ready.
// Run Metro on a dedicated port; leave PORT for health checks.
const EXPO_PORT = PORT + 1;

const child = spawn(
  "pnpm",
  ["exec", "expo", "start", "--localhost", "--port", String(EXPO_PORT)],
  {
    env: {
      ...process.env,
      PORT: String(EXPO_PORT),
      EXPO_PACKAGER_PROXY_URL: `https://${process.env.REPLIT_EXPO_DEV_DOMAIN ?? ""}`,
      EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN ?? "",
      EXPO_PUBLIC_REPL_ID: process.env.REPL_ID ?? "",
      REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REPLIT_DEV_DOMAIN ?? "",
    },
    stdio: "inherit",
  }
);

child.on("exit", (code) => {
  console.log(`[dev] expo exited with code ${code}`);
  process.exit(code ?? 1);
});

process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  health.close();
});
process.on("SIGINT", () => {
  child.kill("SIGINT");
  health.close();
});
