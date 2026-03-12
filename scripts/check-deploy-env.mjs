import { collectEnvValidationIssues, getConfiguredSiteUrl } from '../src/lib/env-policy.mjs'

const result = collectEnvValidationIssues(process.env, 'deploy')
const siteUrl = getConfiguredSiteUrl(process.env)
const hasFailures = result.missing.length > 0 || result.unsafe.length > 0

if (result.warnings.length > 0) {
  console.warn('\nDeploy env warnings:')
  result.warnings.forEach((warning) => console.warn(`  - ${warning}`))
}

if (result.missing.length > 0) {
  console.error('\nMissing required deploy env vars:')
  result.missing.forEach((entry) => console.error(`  - ${entry}`))
}

if (result.unsafe.length > 0) {
  console.error('\nUnsafe deploy env configuration:')
  result.unsafe.forEach((entry) => console.error(`  - ${entry}`))
}

if (hasFailures) {
  console.error('\nDeployment preflight failed.')
  process.exit(1)
}

console.log('Deployment preflight passed.')
console.log(`Notification provider: ${result.provider}`)
console.log(`Canonical site URL: ${siteUrl?.toString()}`)
