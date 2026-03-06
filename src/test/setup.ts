import { afterEach, vi } from 'vitest'

vi.mock('server-only', () => ({}), { virtual: true })

afterEach(() => {
  process.env.NODE_ENV = 'test'
})
