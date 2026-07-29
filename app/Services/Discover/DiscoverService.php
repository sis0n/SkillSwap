<?php

declare(strict_types=1);

namespace App\Services\Discover;

use App\Models\Profile;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DiscoverService
{
    private const int DEFAULT_PER_PAGE = 20;
    private const int MAX_PER_PAGE = 50;

    public function searchUsers(?User $authUser, array $params): LengthAwarePaginator
    {
        $q = $params['q'] ?? null;
        $categoryId = isset($params['category_id']) ? (int) $params['category_id'] : null;
        $type = $params['type'] ?? null;
        $experienceLevel = $params['experience_level'] ?? null;
        $perPage = $this->resolvePerPage($params['per_page'] ?? null);

        $skillFilter = $this->buildSkillFilter($categoryId, $type, $experienceLevel);
        $searchFilter = $this->buildSearchFilter($q);

        $query = $this->buildBaseQuery($authUser, $skillFilter, $searchFilter);

        if ($q) {
            $this->applySearchRanking($query, $q, $skillFilter);
        } else {
            $query->orderBy('users.first_name')
                ->orderBy('users.last_name')
                ->orderBy('users.id');
        }

        $users = $query->paginate($perPage);

        $this->loadMatchedSkills($users, $skillFilter, $searchFilter, $q);

        return $users;
    }

    private function resolvePerPage(null|int|string $perPage): int
    {
        $perPage = $perPage ? (int) $perPage : self::DEFAULT_PER_PAGE;

        return min(max($perPage, 1), self::MAX_PER_PAGE);
    }

    private function buildSkillFilter(?int $categoryId, ?string $type, ?string $experienceLevel): callable
    {
        return function (Builder $query) use ($categoryId, $type, $experienceLevel): void {
            if ($categoryId) {
                $query->whereHas('skill.categories', function (Builder $categoryQuery) use ($categoryId): void {
                    $categoryQuery->where('skill_categories.id', $categoryId);
                });
            }

            if ($type) {
                $query->where('user_skills.type', $type);
            }

            if ($experienceLevel) {
                $query->where('user_skills.experience_level', $experienceLevel);
            }
        };
    }

    private function buildSearchFilter(?string $q): ?callable
    {
        if (!$q) {
            return null;
        }

        $lowerSearch = mb_strtolower($q);

        return function (Builder $query) use ($lowerSearch): void {
            $query->whereHas('skill', function (Builder $skillQuery) use ($lowerSearch): void {
                $skillQuery->whereRaw('LOWER(name) LIKE ?', ['%' . $lowerSearch . '%']);
            });
        };
    }

    private function buildBaseQuery(?User $authUser, callable $skillFilter, ?callable $searchFilter): Builder
    {
        $query = User::select('users.*')
            ->join('profiles', 'users.id', '=', 'profiles.user_id')
            ->whereNotNull('users.email_verified_at')
            ->whereRaw(Profile::completionScoreSql());

        if ($authUser) {
            $query->where('users.id', '!=', $authUser->id);
        }

        $query->whereHas('userSkills', function (Builder $skillQuery) use ($skillFilter, $searchFilter): void {
            $skillFilter($skillQuery);

            if ($searchFilter) {
                $searchFilter($skillQuery);
            }
        });

        $query->distinct();

        return $query;
    }

    private function applySearchRanking(Builder $query, string $searchTerm, callable $skillFilter): void
    {
        $lowerSearch = mb_strtolower($searchTerm);

        $query->orderByDesc(
            $this->buildCountSubQuery($skillFilter, $lowerSearch, exact: true)
        );

        $query->orderByDesc(
            $this->buildCountSubQuery($skillFilter, $lowerSearch, exact: false)
        );

        $query->orderBy('users.first_name')
            ->orderBy('users.last_name')
            ->orderBy('users.id');
    }

    private function buildCountSubQuery(callable $skillFilter, string $lowerSearch, bool $exact): Builder
    {
        $subQuery = UserSkill::whereColumn('user_id', 'users.id');

        $skillFilter($subQuery);

        if ($exact) {
            $subQuery->whereHas('skill', function (Builder $skillQuery) use ($lowerSearch): void {
                $skillQuery->whereRaw('LOWER(name) = ?', [$lowerSearch]);
            });
        } else {
            $subQuery->whereHas('skill', function (Builder $skillQuery) use ($lowerSearch): void {
                $skillQuery->whereRaw('LOWER(name) LIKE ?', ['%' . $lowerSearch . '%']);
            });
        }

        return $subQuery->selectRaw('COUNT(*)');
    }

    private function loadMatchedSkills(LengthAwarePaginator $users, callable $skillFilter, ?callable $searchFilter, ?string $q): void
    {
        $userIds = $users->pluck('id');

        if ($userIds->isEmpty()) {
            return;
        }

        $matchingSkillsQuery = UserSkill::with(['skill.categories'])
            ->whereIn('user_id', $userIds)
            ->where($skillFilter);

        if ($searchFilter) {
            $matchingSkillsQuery->where($searchFilter);
        }

        $allMatchingSkills = $matchingSkillsQuery
            ->get()
            ->groupBy('user_id');

        $users->getCollection()->transform(function (User $user) use ($allMatchingSkills, $q): User {
            $matchingSkills = $allMatchingSkills->get($user->id, collect());

            $orderedSkills = $this->orderMatchedSkills($matchingSkills, $q);

            $user->matched_skills_collection = $orderedSkills->take(3);
            $user->matched_skills_count = $orderedSkills->count();

            return $user;
        });
    }

    private function orderMatchedSkills(Collection $skills, ?string $q): Collection
    {
        if (!$q) {
            return $skills->sortBy(function (UserSkill $userSkill): string {
                return mb_strtolower($userSkill->skill->name);
            })->values();
        }

        $lowerSearch = mb_strtolower($q);

        return $skills->sortBy(function (UserSkill $userSkill) use ($lowerSearch): array {
            $skillName = mb_strtolower($userSkill->skill->name);
            $isExact = $skillName === $lowerSearch ? 0 : 1;

            return [$isExact, $skillName];
        })->values();
    }
}
