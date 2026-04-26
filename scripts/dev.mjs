import { spawn } from "node:child_process";

const processes = [
  ["backend", ["backend/src/server.js"]],
  ["frontend", ["frontend/dev-server.js"]]
];

for (const [name, args] of processes) {
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" }
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with ${code}`);
      process.exitCode = code;
    }
  });
}

process.on("SIGINT", () => process.exit(0));
