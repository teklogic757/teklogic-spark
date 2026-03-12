import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const repoRoot = process.cwd()
const forbiddenTrackedPatterns = [
  /^\.env$/,
  /^\.env\.(?!example$)/,
  /^\.vercel(?:\/|$)/,
  /^\.next(?:\/|$)/,
  /^next-build(?:\/|$)/,
  /^coverage(?:\/|$)/,
  /^node_modules(?:\/|$)/,
  /^\.claude(?:\/|$)/,
  /^\.codex(?:\/|$)/,
]

const requiredIgnoreSnippets = [
  '.env*',
  '!.env.example',
  '/.next/',
  '/next-build/',
  '/.claude/',
  '/.codex/',
  '.vercel',
]

const localOnlyPaths = [
  '.env',
  '.env.local',
  '.vercel',
  '.next',
  'next-build',
  'coverage',
  'node_modules',
  '.claude',
  '.codex',
]

function runGit(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function isIgnored(pathname) {
  try {
    execFileSync('git', ['check-ignore', '-q', pathname], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

const trackedFiles = runGit(['ls-files', '-z'])
  .split('\0')
  .filter(Boolean)

const trackedViolations = trackedFiles.filter((filePath) =>
  forbiddenTrackedPatterns.some((pattern) => pattern.test(filePath))
)

const gitignore = readFileSync('.gitignore', 'utf8')
const missingIgnoreRules = requiredIgnoreSnippets.filter((snippet) => !gitignore.includes(snippet))

const unignoredLocalArtifacts = localOnlyPaths.filter((pathname) => existsSync(pathname) && !isIgnored(pathname))
const presentIgnoredArtifacts = localOnlyPaths.filter((pathname) => existsSync(pathname) && isIgnored(pathname))

if (trackedViolations.length > 0 || missingIgnoreRules.length > 0 || unignoredLocalArtifacts.length > 0) {
  console.error('\nRepository hygiene check failed.\n')

  if (trackedViolations.length > 0) {
    console.error('Tracked local-only or secret files:')
    trackedViolations.forEach((entry) => console.error(`  - ${entry}`))
    console.error('')
  }

  if (missingIgnoreRules.length > 0) {
    console.error('Missing expected .gitignore rules:')
    missingIgnoreRules.forEach((entry) => console.error(`  - ${entry}`))
    console.error('')
  }

  if (unignoredLocalArtifacts.length > 0) {
    console.error('Present local-only artifacts that are not ignored:')
    unignoredLocalArtifacts.forEach((entry) => console.error(`  - ${entry}`))
    console.error('')
  }

  console.error('Fix the repo boundary, then rerun `npm run check:repo-hygiene`.\n')
  process.exit(1)
}

console.log('Repository hygiene check passed.')

if (presentIgnoredArtifacts.length > 0) {
  console.log('\nIgnored local-only artifacts present in this clone:')
  presentIgnoredArtifacts.forEach((entry) => console.log(`  - ${entry}`))
}
