#!/usr/bin/env node
/**
 * Environment Check for OpenCode Agent Army — Anime Video Pipeline
 *
 * Verifies:
 * - Node.js version
 * - npm version
 * - FFmpeg availability
 * - HyperFrames CLI
 * - Writable directories
 *
 * Usage: node scripts/env-check.mjs
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REQUIRED_NODE = 22;
const REQUIRED_NPM = 10;

let pass = 0;
let fail = 0;
let warn = 0;

function check(label, condition, severity = "fail") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    pass++;
  } else if (severity === "warn") {
    console.log(`  ⚠️  ${label}`);
    warn++;
  } else {
    console.log(`  ❌ ${label}`);
    fail++;
  }
}

function cmdOk(cmd) {
  try {
    execSync(cmd, { stdio: "ignore", timeout: 5000, shell: "powershell" });
    return true;
  } catch {
    return false;
  }
}

function cmdVersion(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: 5000, shell: "powershell" }).toString().trim();
  } catch {
    return null;
  }
}

console.log("\n🔍 OpenCode Agent Army — Environment Check\n");
console.log(`Working directory: ${ROOT}\n`);

// --- Node.js ---
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.replace("v", "").split(".")[0], 10);
console.log(`[Node.js] v${nodeVersion.replace("v", "")}`);
check(`Node.js >= ${REQUIRED_NODE} (found: ${nodeMajor})`, nodeMajor >= REQUIRED_NODE);

// --- npm ---
const npmVersion = cmdVersion("npm --version");
console.log(`[npm] v${npmVersion}`);
check(`npm >= ${REQUIRED_NPM} (found: ${npmVersion})`, parseInt(npmVersion, 10) >= REQUIRED_NPM);

// --- FFmpeg ---
const ffmpegVersion = cmdVersion("ffmpeg -version 2>&1 | Select-String -Pattern 'ffmpeg version' | ForEach-Object { $_ -replace '.*ffmpeg version\\s*([^\\s]+).*', '$1' }");
console.log(`[FFmpeg] ${ffmpegVersion || "not found"}`);
check("FFmpeg installed", !!ffmpegVersion);
check("FFmpeg has libass", cmdOk("ffmpeg -filters 2>&1 | Select-String -Pattern ' ass'"), "warn");

// --- HyperFrames ---
const hfVersion = cmdVersion("npx hyperframes --version 2>&1");
console.log(`[HyperFrames] ${hfVersion || "not found"}`);
check("HyperFrames CLI accessible", !!hfVersion);

// --- package.json dependencies ---
const pkgPath = path.join(ROOT, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  check("package.json exists and has hyperframes", !!deps.hyperframes);
} else {
  check("package.json exists", false);
}

// --- Writable directories ---
const requiredDirs = [
  "schemas",
  "templates/anime-short",
  "characters/example-character",
  "scripts",
  "projects/generated-projects",
  "qa",
];
for (const dir of requiredDirs) {
  const fullPath = path.join(ROOT, dir);
  check(`Directory exists: ${dir}`, fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory());
}

// --- .gitignore coverage ---
const gitignorePath = path.join(ROOT, ".gitignore");
if (fs.existsSync(gitignorePath)) {
  const content = fs.readFileSync(gitignorePath, "utf8");
  check(".gitignore ignores .env files", content.includes(".env"));
  check(".gitignore ignores node_modules", content.includes("node_modules"));
  check(".gitignore ignores renders", content.includes("renders/"));
  check(".gitignore ignores snapshots", content.includes("snapshots/"));
} else {
  check(".gitignore exists", false);
}

// --- Summary ---
console.log(`\n📊 Results: ${pass} passed, ${fail} failed, ${warn} warnings\n`);

if (fail > 0) {
  console.log("❌ Some checks failed. Fix them before proceeding with media pipeline.\n");
  process.exit(1);
} else {
  console.log("✅ All critical checks passed. Ready for media pipeline.\n");
  process.exit(0);
}
