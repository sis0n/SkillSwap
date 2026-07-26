<?php

declare(strict_types=1);

namespace App\Services\Profile;

use App\Models\PortfolioLink;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PortfolioLinkService
{
    public function getLinks(User $user): Collection
    {
        return $user->portfolioLinks()->orderBy('display_order')->orderBy('id')->get();
    }

    public function createLink(User $user, array $data): PortfolioLink
    {
        return DB::transaction(function () use ($user, $data) {
            $maxOrder = $user->portfolioLinks()->max('display_order') ?? -1;
            $data['display_order'] = $data['display_order'] ?? ($maxOrder + 1);

            return $user->portfolioLinks()->create($data);
        });
    }

    public function updateLink(PortfolioLink $link, array $data): PortfolioLink
    {
        return DB::transaction(function () use ($link, $data) {
            $link->update($data);
            return $link->fresh();
        });
    }

    public function deleteLink(PortfolioLink $link): void
    {
        DB::transaction(function () use ($link) {
            $order = $link->display_order;
            $userId = $link->user_id;
            $link->delete();

            PortfolioLink::where('user_id', $userId)
                ->where('display_order', '>', $order)
                ->decrement('display_order');
        });
    }

    public function reorderLinks(User $user, array $orderedIds): Collection
    {
        return DB::transaction(function () use ($user, $orderedIds) {
            $existing = $user->portfolioLinks()->get()->keyBy('id');

            foreach ($orderedIds as $index => $id) {
                if ($existing->has($id)) {
                    $existing[$id]->update(['display_order' => $index]);
                }
            }

            return $this->getLinks($user);
        });
    }
}
