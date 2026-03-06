type Filter = {
  column: string
  value: unknown
}

type QueryResult = {
  data: unknown
  error: unknown
}

type TableBehavior = {
  rows?: Array<Record<string, unknown>>
  maybeSingle?: (filters: Filter[]) => QueryResult
  single?: (filters: Filter[]) => QueryResult
  insert?: (payload: unknown) => QueryResult
  update?: (payload: unknown, filters: Filter[]) => QueryResult
}

type CreateSupabaseMockOptions = {
  authUser?: unknown
  authError?: unknown
  tables?: Record<string, TableBehavior>
  rpc?: (name: string, args: unknown) => Promise<QueryResult>
}

function applyFilters(rows: Array<Record<string, unknown>>, filters: Filter[]) {
  return rows.filter((row) => filters.every((filter) => row[filter.column] === filter.value))
}

function emptyQueryResult(): Promise<QueryResult> {
  return Promise.resolve({ data: null, error: null })
}

export function createSupabaseMock(options: CreateSupabaseMockOptions = {}) {
  const tables = options.tables ?? {}

  const from = (tableName: string) => {
    const behavior = tables[tableName] ?? {}
    const filters: Filter[] = []
    let updatePayload: unknown

    const query = {
      select: () => query,
      order: () => query,
      limit: () => query,
      eq: (column: string, value: unknown) => {
        filters.push({ column, value })
        return query
      },
      maybeSingle: async () => {
        if (behavior.maybeSingle) {
          return behavior.maybeSingle(filters)
        }

        if (!behavior.rows) {
          return { data: null, error: null }
        }

        const [row] = applyFilters(behavior.rows, filters)
        return { data: row ?? null, error: null }
      },
      single: async () => {
        if (behavior.single) {
          return behavior.single(filters)
        }

        if (!behavior.rows) {
          return { data: null, error: { message: 'Not found' } }
        }

        const [row] = applyFilters(behavior.rows, filters)
        return row ? { data: row, error: null } : { data: null, error: { message: 'Not found' } }
      },
      insert: async (payload: unknown) => {
        if (behavior.insert) {
          return behavior.insert(payload)
        }

        return { data: null, error: null }
      },
      update: (payload: unknown) => {
        updatePayload = payload
        return {
          eq: async (column: string, value: unknown) => {
            const scopedFilters = [...filters, { column, value }]
            if (behavior.update) {
              return behavior.update(updatePayload, scopedFilters)
            }

            return { data: null, error: null }
          },
        }
      },
      then: (
        onFulfilled?: (value: QueryResult) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => {
        const execute = async (): Promise<QueryResult> => {
          if (!behavior.rows) {
            return { data: [], error: null }
          }

          return { data: applyFilters(behavior.rows, filters), error: null }
        }

        return execute().then(onFulfilled, onRejected)
      },
    }

    return query
  }

  return {
    auth: {
      getUser: async () => ({
        data: {
          user: options.authUser ?? null,
        },
        error: options.authError ?? null,
      }),
    },
    from,
    rpc: async (name: string, args: unknown) => {
      if (options.rpc) {
        return options.rpc(name, args)
      }

      return emptyQueryResult()
    },
    storage: {
      listBuckets: async () => ({ data: [], error: null }),
      createBucket: async () => ({ data: null, error: null }),
      from: () => ({
        upload: async () => ({ data: null, error: null }),
      }),
    },
  }
}
