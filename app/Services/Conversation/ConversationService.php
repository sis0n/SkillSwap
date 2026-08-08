<?php

declare(strict_types=1);

namespace App\Services\Conversation;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ConversationService
{
    private const int DEFAULT_PER_PAGE = 20;

    private const int MAX_PER_PAGE = 50;

    private const array SUMMARY_WITH = [
        'exchangeRequest.sender.profile',
        'exchangeRequest.receiver.profile',
    ];

    public function list(User $user, array $params): LengthAwarePaginator
    {
        $perPage = $this->resolvePerPage($params['per_page'] ?? null);

        $conversations = Conversation::query()
            ->with(self::SUMMARY_WITH)
            ->whereHas('exchangeRequest', function (Builder $query) use ($user): void {
                $query->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            })
            ->orderByDesc('updated_at')
            ->paginate($perPage);

        $this->attachLastMessages($conversations->getCollection());
        $this->attachUnreadCounts($conversations->getCollection(), $user);

        return $conversations;
    }

    public function show(User $user, Conversation $conversation): Conversation
    {
        $conversation->load(self::SUMMARY_WITH);

        $this->attachLastMessages(collect([$conversation]));
        $this->attachUnreadCounts(collect([$conversation]), $user);

        return $conversation;
    }

    public function messages(User $user, Conversation $conversation, array $params): LengthAwarePaginator
    {
        $this->markIncomingAsRead($conversation, $user);

        $perPage = $this->resolvePerPage($params['per_page'] ?? null);

        return $conversation->messages()
            ->with('sender.profile')
            ->orderBy('created_at')
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function send(User $sender, Conversation $conversation, string $body): Message
    {
        return DB::transaction(function () use ($sender, $conversation, $body): Message {
            $message = $conversation->messages()->create([
                'sender_id' => $sender->id,
                'body' => $body,
                'read_at' => null,
            ]);

            $conversation->touch();

            return $message->load('sender.profile');
        });
    }

    private function attachLastMessages(Collection $conversations): void
    {
        if ($conversations->isEmpty()) {
            return;
        }

        $lastMessages = Message::query()
            ->whereIn('conversation_id', $conversations->pluck('id'))
            ->with('sender.profile')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->groupBy('conversation_id');

        foreach ($conversations as $conversation) {
            $conversation->setRelation('lastMessage', $lastMessages->get($conversation->id)?->first());
        }
    }

    private function attachUnreadCounts(Collection $conversations, User $user): void
    {
        if ($conversations->isEmpty()) {
            return;
        }

        $unreadCounts = Message::query()
            ->whereIn('conversation_id', $conversations->pluck('id'))
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->selectRaw('conversation_id, COUNT(*) as unread_count')
            ->groupBy('conversation_id')
            ->pluck('unread_count', 'conversation_id');

        foreach ($conversations as $conversation) {
            $conversation->setAttribute('unread_count', (int) ($unreadCounts[$conversation->id] ?? 0));
        }
    }

    private function markIncomingAsRead(Conversation $conversation, User $user): void
    {
        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    private function resolvePerPage(null|int|string $perPage): int
    {
        $perPage = $perPage ? (int) $perPage : self::DEFAULT_PER_PAGE;

        return min(max($perPage, 1), self::MAX_PER_PAGE);
    }
}
