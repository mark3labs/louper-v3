#!/usr/bin/env bun
/**
 * Migration Validation Script
 * Validates that the project is ready for dependency migration
 */

import { $ } from "bun";
import { existsSync } from "fs";

let hasErrors = false;

console.log("🔍 Validating migration readiness...\n");

// Check 1: Git working directory is clean
console.log("Checking git status...");
try {
  const result = await $`git status --porcelain`.text();
  if (result.trim().length > 0) {
    console.log("❌ Git working directory is not clean");
    console.log("   Please commit or stash your changes before migrating");
    hasErrors = true;
  } else {
    console.log("✅ Git working directory is clean");
  }
} catch (error) {
  console.log("⚠️  Warning: Unable to check git status");
}

// Check 2: package.json exists
console.log("\nChecking package.json...");
if (existsSync("package.json")) {
  console.log("✅ package.json exists");
} else {
  console.log("❌ package.json not found");
  hasErrors = true;
}

// Check 3: node_modules exists (dependencies installed)
console.log("\nChecking dependencies...");
if (existsSync("node_modules")) {
  console.log("✅ Dependencies are installed");
} else {
  console.log("❌ Dependencies not installed. Run 'bun install' first");
  hasErrors = true;
}

// Check 4: Backup directory setup
console.log("\nChecking backup directory...");
if (!existsSync(".backup")) {
  console.log("⚠️  .backup directory doesn't exist, will be created");
} else {
  console.log("✅ .backup directory exists");
}

// Check 5: Current dependency versions
console.log("\nChecking current dependency versions...");
try {
  const packageJson = await Bun.file("package.json").json();
  const currentSvelte = packageJson.devDependencies?.svelte || packageJson.dependencies?.svelte;
  const currentKit = packageJson.devDependencies?.["@sveltejs/kit"];
  const currentVite = packageJson.devDependencies?.vite;
  
  console.log(`   Current Svelte: ${currentSvelte}`);
  console.log(`   Current SvelteKit: ${currentKit}`);
  console.log(`   Current Vite: ${currentVite}`);
  console.log("✅ Version check complete");
} catch (error) {
  console.log("❌ Failed to read package.json");
  hasErrors = true;
}

// Final result
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log("❌ Validation failed. Please fix the issues above before proceeding.");
  process.exit(1);
} else {
  console.log("✅ All validation checks passed! Ready for migration.");
  process.exit(0);
}
