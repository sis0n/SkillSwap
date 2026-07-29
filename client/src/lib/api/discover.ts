import api from "@/lib/axios"
import type { ApiResponse } from "@/lib/api/types"
import type { DiscoverSearchParams, DiscoverUser, DiscoverPaginationMeta } from "@/features/discover/types/discover"

export interface DiscoverResponseData {
  users: DiscoverUser[]
  meta: DiscoverPaginationMeta
}

export async function searchDiscover(params: DiscoverSearchParams): Promise<ApiResponse<DiscoverResponseData>> {
  const cleanParams: Record<string, string | number | undefined> = {}
  if (params.q) cleanParams.q = params.q
  if (params.category_id) cleanParams.category_id = params.category_id
  if (params.type) cleanParams.type = params.type
  if (params.experience_level) cleanParams.experience_level = params.experience_level
  if (params.page) cleanParams.page = params.page
  if (params.per_page) cleanParams.per_page = params.per_page

  const response = await api.get<ApiResponse<DiscoverResponseData>>("/api/v1/discover", {
    params: cleanParams,
  })
  return response.data
}