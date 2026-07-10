import { useState, useCallback } from 'react'
import type { PaginationState } from '../types/common.types'

export function usePagination(initialPerPage = 20) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: initialPerPage,
    total: 0,
  })

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setPerPage = useCallback((perPage: number) => {
    setPagination((prev) => ({ ...prev, perPage, page: 1 }))
  }, [])

  const setTotal = useCallback((total: number) => {
    setPagination((prev) => ({ ...prev, total }))
  }, [])

  return { pagination, setPage, setPerPage, setTotal }
}
