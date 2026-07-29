import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { searchDiscover } from "@/lib/api/discover"
import { useDebounce } from "@/hooks/useDebounce"
import type { DiscoverSearchParams } from "../types/discover"

export function useDiscoverSearch(params: DiscoverSearchParams) {
  const debouncedQ = useDebounce(params.q, 300)

  const effectiveParams: DiscoverSearchParams = {
    ...params,
    q: debouncedQ || undefined,
  }

  return useQuery({
    queryKey: ["discover", effectiveParams],
    queryFn: async () => {
      const response = await searchDiscover(effectiveParams)
      if (!response.success) throw new Error(response.message)
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
