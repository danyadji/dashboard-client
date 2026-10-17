import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { api, getToken, setToken, clearToken } from './api.js'

export { api, getToken, setToken, clearToken, useMutation, useQueryClient, useInfiniteQuery }

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api('/me'),
    enabled,
    retry: 1,
  })
}

export function useStats() {
  return useQuery({ queryKey: ['stats'], queryFn: () => api('/stats'), retry: 1 })
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

export function useWishes(page = 1) {
  return useQuery({ queryKey: ['wishes', page], queryFn: () => api(`/wishes?page=${page}`), keepPreviousData: true })
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
