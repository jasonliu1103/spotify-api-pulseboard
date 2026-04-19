import { spawn, spawnSync } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";

const host = process.env.HOST ?? "127.0.0.1";
const port = process.env.PORT ?? "3000";
const cwd = process.cwd();
const prismaSchemaPath = path.join(cwd, "prisma", "schema.prisma");
const generatedPrismaSchemaPath = path.join(
  cwd,
  "node_modules",
  ".prisma",
  "client",
  "schema.prisma",
);
const prismaCliPath = path.join(
  cwd,
  "node_modules",
  "prisma",
  "build",
  "index.js",
);
const skipPrismaDbDriftCheck = process.env.SKIP_PRISMA_DB_DRIFT_CHECK === "1";

async function shouldGeneratePrismaClient() {
  try {
    const [schemaStats, generatedSchemaStats] = await Promise.all([
      stat(prismaSchemaPath),
      stat(generatedPrismaSchemaPath),
    ]);

    return schemaStats.mtimeMs > generatedSchemaStats.mtimeMs;
  } catch {
    return true;
  }
}

async function ensurePrismaClient() {
  if (!(await shouldGeneratePrismaClient())) {
    return;
  }

  console.log("Prisma schema changed. Regenerating client...");

  const result = spawnSync(process.execPath, [prismaCliPath, "generate"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function formatPrismaOutput(output) {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)
    .join("\n");
}

async function warnIfDatabaseSchemaDrifted() {
  if (skipPrismaDbDriftCheck) {
    return;
  }

  const result = spawnSync(
    process.execPath,
    [
      prismaCliPath,
      "migrate",
      "diff",
      "--exit-code",
      "--from-schema-datasource",
      prismaSchemaPath,
      "--to-schema-datamodel",
      prismaSchemaPath,
    ],
    {
      encoding: "utf8",
      env: process.env,
    },
  );

  if (result.status === 0) {
    return;
  }

  const details = formatPrismaOutput(`${result.stdout}\n${result.stderr}`);

  if (result.status === 2) {
    console.warn(
      [
        "Warning: Prisma schema and local database look out of sync.",
        "Run `npm run db:push` to update your local Postgres schema.",
        details,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return;
  }

  console.warn(
    [
      "Warning: Skipping Prisma database drift check before dev startup.",
      "If you recently changed `prisma/schema.prisma`, run `npm run db:push` after Postgres is available.",
      details,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

await ensurePrismaClient();
await warnIfDatabaseSchemaDrifted();

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
