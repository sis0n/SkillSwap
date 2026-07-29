import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"

import { useSkillCategories } from "@/features/skills/hooks/useSkills"
import { DiscoverEmptyState } from "@/features/discover/components/DiscoverEmptyState"
import { DiscoverErrorState } from "@/features/discover/components/DiscoverErrorState"
import { DiscoverFilters } from "@/features/discover/components/DiscoverFilters"
import { DiscoverGrid } from "@/features/discover/components/DiscoverGrid"
import { DiscoverLoadingState } from "@/features/discover/components/DiscoverLoadingState"
import { DiscoverPagination } from "@/features/discover/components/DiscoverPagination"
import { DiscoverSearchBar } from "@/features/discover/components/DiscoverSearchBar"
import { DiscoverSearchCard } from "@/features/discover/components/DiscoverSearchCard"
import { ViewSkillsModal } from "@/features/discover/components/ViewSkillsModal"
import { useDiscoverSearch } from "@/features/discover/hooks/useDiscoverSearch"
import type { DiscoverSearchParams, DiscoverUser } from "@/features/discover/types/discover"

function numParam(param: string | null): number | undefined {
  if (param === null) return undefined
  const n = Number(param)
  return Number.isNaN(n) ? undefined : n
}

export default function DiscoverPage() {
  const [skillsUser, setSkillsUser] = useState<DiscoverUser | null>(null)
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()

  const searchParams: DiscoverSearchParams = useMemo(() => {
    const rawType = urlSearchParams.get("type")
    const rawExp = urlSearchParams.get("experience_level")
    return {
      q: urlSearchParams.get("q") || undefined,
      category_id: numParam(urlSearchParams.get("category_id")),
      type: rawType === "teaching" || rawType === "learning" ? rawType : undefined,
      experience_level: rawExp === "beginner" || rawExp === "intermediate" || rawExp === "advanced" || rawExp === "expert" ? rawExp : undefined,
      page: Math.max(1, numParam(urlSearchParams.get("page")) ?? 1),
      per_page: Math.min(50, Math.max(1, numParam(urlSearchParams.get("per_page")) ?? 20)),
    }
  }, [urlSearchParams])

  const { data, isLoading, isError, error, refetch } = useDiscoverSearch(searchParams)
  const { data: categories = [] } = useSkillCategories()

  const users = data?.users ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const activeFilterCount = [searchParams.category_id, searchParams.type, searchParams.experience_level].filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0 || !!searchParams.q

  function rebuildParams(updates: Record<string, string | null>): URLSearchParams {
    const next = new URLSearchParams(urlSearchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    return next
  }

  function handleSearchChange(value: string) {
    setUrlSearchParams(rebuildParams({ q: value || null, page: null }), { replace: true })
  }

  function handleCategoryChange(value: string) {
    setUrlSearchParams(rebuildParams({ category_id: value || null, page: null }))
  }

  function handleTypeChange(value: string) {
    setUrlSearchParams(rebuildParams({ type: value || null, page: null }))
  }

  function handleExperienceLevelChange(value: string) {
    setUrlSearchParams(rebuildParams({ experience_level: value || null, page: null }))
  }

  function handleClearFilters() {
    setUrlSearchParams({})
  }

  function handlePageChange(page: number) {
    setUrlSearchParams(rebuildParams({ page: page > 1 ? String(page) : null }))
  }

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories],
  )

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        <p className="mt-2 text-muted-foreground">
          Find people who want to teach and learn skills. Discover your next learning partner.
        </p>
      </section>

      <div className="space-y-4">
        <DiscoverSearchBar value={searchParams.q ?? ""} onChange={handleSearchChange} />

        <DiscoverFilters
          category={searchParams.category_id ? String(searchParams.category_id) : ""}
          type={searchParams.type ?? ""}
          experienceLevel={searchParams.experience_level ?? ""}
          categories={categoryOptions}
          activeFilterCount={activeFilterCount}
          onCategoryChange={handleCategoryChange}
          onTypeChange={handleTypeChange}
          onExperienceLevelChange={handleExperienceLevelChange}
          onClear={handleClearFilters}
        />
      </div>

      {isLoading ? (
        <DiscoverLoadingState />
      ) : isError ? (
        <DiscoverErrorState message={error instanceof Error ? error.message : undefined} onRetry={() => refetch()} />
      ) : users.length === 0 ? (
        hasActiveFilters ? (
          <DiscoverEmptyState hasFilters />
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Browse potential learning partners</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Use the search bar or filters above to find people who match your learning goals.
            </p>
          </div>
        )
      ) : (
        <>
          <DiscoverGrid>
            {users.map((user) => (
              <DiscoverSearchCard key={user.id} user={user} onViewSkills={setSkillsUser} />
            ))}
          </DiscoverGrid>

          <DiscoverPagination
            currentPage={meta.current_page}
            totalPages={meta.last_page}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ViewSkillsModal user={skillsUser} onClose={() => setSkillsUser(null)} />
    </div>
  )
}
