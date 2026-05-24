#!/usr/bin/env node

import { readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

function formatPath(targetPath) {
  return path.relative(repoRoot, targetPath).split(path.sep).join('/')
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath)
    return true
  } catch {
    return false
  }
}

async function walkDirectories(rootDir, visitDirectory) {
  let entries = []

  try {
    entries = await readdir(rootDir, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const fullPath = path.join(rootDir, entry.name)
    const shouldDescend = await visitDirectory(fullPath, entry.name)

    if (shouldDescend !== false) {
      await walkDirectories(fullPath, visitDirectory)
    }
  }
}

async function collectBackendBuildDirectories() {
  const backendRoot = path.join(repoRoot, 'src', 'backend')
  const directories = []

  await walkDirectories(backendRoot, async (fullPath, name) => {
    if (name === 'bin' || name === 'obj') {
      directories.push(fullPath)
      return false
    }

    return true
  })

  return directories
}

async function collectFrontendGeneratedTargets() {
  const frontendRoot = path.join(repoRoot, 'src', 'frontend')
  const targets = []
  const distDir = path.join(frontendRoot, 'dist')

  if (await pathExists(distDir)) {
    targets.push(distDir)
  }

  const openApiDir = path.join(frontendRoot, 'openapi')

  try {
    const openApiEntries = await readdir(openApiDir, { withFileTypes: true })
    for (const entry of openApiEntries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        targets.push(path.join(openApiDir, entry.name))
      }
    }
  } catch {
    // Ignore missing directory.
  }

  const modulesDir = path.join(frontendRoot, 'src', 'modules')

  try {
    const moduleEntries = await readdir(modulesDir, { withFileTypes: true })
    for (const entry of moduleEntries) {
      if (!entry.isDirectory() || entry.name === 'shared') {
        continue
      }

      const generatedDir = path.join(modulesDir, entry.name, 'api', 'generated')
      if (await pathExists(generatedDir)) {
        targets.push(generatedDir)
      }
    }
  } catch {
    // Ignore missing directory.
  }

  return targets
}

function uniqueTargets(targets) {
  return [...new Set(targets)].sort((left, right) => formatPath(left).localeCompare(formatPath(right)))
}

async function removeTargets(targets) {
  for (const target of targets) {
    if (dryRun) {
      console.log(`Would remove ${formatPath(target)}`)
      continue
    }

    await rm(target, { recursive: true, force: true })
    console.log(`Removed ${formatPath(target)}`)
  }
}

const targets = uniqueTargets([
  ...(await collectBackendBuildDirectories()),
  ...(await collectFrontendGeneratedTargets()),
])

if (targets.length === 0) {
  console.log('Nothing to remove.')
  process.exit(0)
}

console.log(dryRun ? 'Dry run for generated artifacts:' : 'Cleaning generated artifacts:')
await removeTargets(targets)
