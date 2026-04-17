import { spawn } from "node:child_process";

const host = process.env.HOST ?? "127.0.0.1";
const port = process.env.PORT ?? "3000";

const child = spawn(
  process.execPath,
  ["./node_modules/next/dist/bin/next", "dev", "-H", host, "-p", port],
  {
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
