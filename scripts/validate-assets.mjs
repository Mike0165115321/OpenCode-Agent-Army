#!/usr/bin/env node
/**
 * Validate Assets — Check that all assets in manifest files exist and have correct properties
 *
 * Usage: node scripts/validate-assets.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let pass = 0;
let fail = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    pass++;
  } else {
    console.log(`  ❌ ${label}`);
    fail++;
  }
}

console.log("\n🧩 Asset Validation\n");

// Find all asset manifests
const characterDir = path.join(ROOT, "characters");
if (!fs.existsSync(characterDir)) {
  console.log("❌ No characters/ directory found\n");
  process.exit(1);
}

const characterIds = fs.readdirSync(characterDir).filter((f) => {
  const fullPath = path.join(characterDir, f);
  return fs.statSync(fullPath).isDirectory();
});

if (characterIds.length === 0) {
  console.log("⚠️  No character directories found\n");
  process.exit(0);
}

for (const charId of characterIds) {
  console.log(`\n📁 Character: ${charId}`);
  const charPath = path.join(characterDir, charId);

  // Check CHARACTER.md exists
  const charMdPath = path.join(charPath, "CHARACTER.md");
  check("CHARACTER.md exists", fs.existsSync(charMdPath));

  // Check manifest.json exists
  const manifestPath = path.join(charPath, "manifest.json");
  check("manifest.json exists", fs.existsSync(manifestPath));

  if (!fs.existsSync(manifestPath)) {
    console.log(`  ⏭️  Skipping asset checks for ${charId} (no manifest)\n`);
    continue;
  }

  // Read manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const assets = manifest.assets || [];

  console.log(`  📦 ${assets.length} asset(s) declared`);

  for (const asset of assets) {
    const assetPath = path.join(ROOT, asset.file);
    const fileExists = fs.existsSync(assetPath);

    check(`[${asset.id}] file exists: ${asset.file}`, fileExists);

    if (fileExists && asset.transparent) {
      // Basic check: verify it's an image file (SVG or PNG)
      const ext = path.extname(asset.file).toLowerCase();
      check(`[${asset.id}] is SVG/PNG for transparency`, ext === ".svg" || ext === ".png");
    }

    // Check status
    const validStatuses = ["requested", "generated", "needs-review", "approved", "rejected"];
    check(`[${asset.id}] status is valid: ${asset.status}`, validStatuses.includes(asset.status));

    // For approved assets, file must exist
    if (asset.status === "approved") {
      check(`[${asset.id}] approved asset exists on disk`, fileExists);
    }
  }
}

console.log(`\n📊 Results: ${pass} passed, ${fail} failed\n`);

if (fail > 0) {
  console.log("❌ Asset validation failed. Fix before proceeding with media pipeline.\n");
  process.exit(1);
} else {
  console.log("✅ All assets validated.\n");
  process.exit(0);
}
