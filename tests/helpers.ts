import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const root = join(import.meta.dir, "..");

export type Started = {
  proc: ReturnType<typeof Bun.spawn>;
  stdout: Promise<string>;
  stderr: Promise<string>;
  dbPath: string;
  port: number;
  dir: string;
};

export const freePort = () => {
  const server = Bun.listen({
    hostname: "127.0.0.1",
    port: 0,
    socket: {
      data() {},
      open() {},
      close() {},
      error() {},
    },
  });
  const { port } = server;
  server.stop(true);
  return port;
};

export const startBuffet = async (
  dbPath: string,
  dir: string,
): Promise<Started> => {
  const port = freePort();
  const proc = Bun.spawn({
    cmd: [
      "bun",
      "--no-env-file",
      "--tsconfig-override=config/tsconfig.app.json",
      "app.ts",
    ],
    cwd: root,
    env: {
      ...process.env,
      DB_PATH: dbPath,
      PORT: String(port),
      NODE_ENV: "development",
      BUN_PUBLIC_DOMAIN: `http://127.0.0.1:${port}`,
      BETTER_AUTH_SECRET: "test-process-shutdown-secret-32chars",
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = new Response(proc.stdout).text();
  const stderr = new Response(proc.stderr).text();
  const started = { proc, stdout, stderr, dbPath, port, dir };

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) {
      throw new Error(
        `Buffet exited before it was ready (${proc.exitCode})\n${await stdout}\n${await stderr}`,
      );
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.status > 0) return started;
    } catch {
      await Bun.sleep(50);
    }
  }

  throw new Error(
    `Buffet did not become ready in time\n${await Promise.race([stdout, Promise.resolve("(stdout still open)")])}\n${await Promise.race([stderr, Promise.resolve("(stderr still open)")])}`,
  );
};

export const signalAndWait = async (
  started: Started,
  signal: "SIGINT" | "SIGTERM",
) => {
  started.proc.kill(signal);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${signal} did not exit within 5 seconds`));
    }, 5000);
  });
  try {
    const code = await Promise.race([started.proc.exited, timeout]);
    if (code !== 0) {
      throw new Error(
        `${signal} exited with ${code}\n${await started.stdout}\n${await started.stderr}`,
      );
    }
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
};

export const tempDbDir = () => mkdtemp(join(tmpdir(), "buffet-test-"));

export const stopIfRunning = async (started: Started) => {
  if (started.proc.exitCode === null) {
    started.proc.kill("SIGKILL");
    await started.proc.exited;
  }
  await rm(started.dir, { recursive: true, force: true });
};
