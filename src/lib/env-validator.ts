/**
 * Environment validation entrypoints shared by runtime startup and deploy checks.
 */

import { collectEnvValidationIssues, isProductionEnvironment } from './env-policy.mjs'

export type EnvValidationMode = 'runtime' | 'deploy'

export type EnvValidationResult = {
  missing: string[]
  warnings: string[]
  unsafe: string[]
  provider: string
}

export function getEnvValidationResult(
  mode: EnvValidationMode = 'runtime',
  env: NodeJS.ProcessEnv = process.env
): EnvValidationResult {
  return collectEnvValidationIssues(env, mode) as EnvValidationResult
}

function printValidationMessages(result: EnvValidationResult, mode: EnvValidationMode): void {
  const headingSuffix = mode === 'deploy' ? ' (deploy preflight)' : ''

  if (result.warnings.length > 0) {
    console.warn(`\nEnvironment Configuration Warnings${headingSuffix}:`)
    result.warnings.forEach((warning) => console.warn(`   - ${warning}`))
    console.warn('')
  }

  if (result.unsafe.length > 0) {
    console.error(`\nUnsafe environment configuration${headingSuffix}:`)
    result.unsafe.forEach((issue) => console.error(`   - ${issue}`))
    console.error('')
  }

  if (result.missing.length > 0) {
    console.error(`\nMissing required environment variables${headingSuffix}:`)
    result.missing.forEach((entry) => console.error(`   - ${entry}`))
    console.error('\nPlease set these variables in your environment or .env.local file.\n')
  }
}

export function validateEnv(mode: EnvValidationMode = 'runtime', env: NodeJS.ProcessEnv = process.env): void {
  const result = getEnvValidationResult(mode, env)
  const shouldFailOnMissing = mode === 'deploy' || isProductionEnvironment(env)
  const hasFailures = result.unsafe.length > 0 || (shouldFailOnMissing && result.missing.length > 0)

  printValidationMessages(result, mode)

  if (hasFailures) {
    const failureMessages = [...result.missing.map((entry) => entry.split(' - ')[0]), ...result.unsafe]
    throw new Error(`Environment validation failed: ${failureMessages.join(' | ')}`)
  }
}
