import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api, getToken, setToken, clearToken } from './api.js'

export { api, getToken, setToken, clearToken, useMutation, useQueryClient, useInfiniteQuery }

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api('/me'),
    enabled,
    retry: 1,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api('/stats'),
    retry: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useGuests(params = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', params.page)
  if (params.per_page) qs.set('per_page', params.per_page)
  return useQuery({
    queryKey: ['guests', params],
    queryFn: () => api(`/guests?${qs}`),
    keepPreviousData: true,
    staleTime: 20 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useGuestsInfinite(search = '', rsvp = '', perPage = 20) {
  return useInfiniteQuery({
    queryKey: ['guests-inf', search, rsvp],
    queryFn: ({ pageParam = 1 }) => {
      const qs = new URLSearchParams({ per_page: String(perPage), page: String(pageParam) })
      if (search) qs.set('search', search)
      if (rsvp && rsvp !== 'semua') qs.set('rsvp', rsvp)
      return api(`/guests?${qs}`)
    },
    getNextPageParam: (last) => (last.page < last.pages ? last.page + 1 : undefined),
    keepPreviousData: true,
  })
}

export function useWishes({ page = 1, perPage = 10, status = 'semua' } = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  })
  if (status && status !== 'semua') qs.set('status', status)

  return useQuery({
    queryKey: ['wishes', page, perPage, status],
    queryFn: () => api(`/wishes?${qs}`),
    keepPreviousData: true,
    staleTime: 15 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useInvalidate() {
  const qc = useQueryClient()
  return (...keys) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }))
}

export function useMutationApi(fn, keys = []) {
  const inv = useInvalidate()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => inv(...keys),
  })
}

export function useMutationApiNoInvalidate(fn, opts = {}) {
  return useMutation({ mutationFn: fn, ...opts })
}

export function useLogout() {
  return { logout: () => { clearToken(); window.location.assign('/login') } }
}

export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isLocked])
}
