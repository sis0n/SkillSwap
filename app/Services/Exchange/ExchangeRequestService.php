<?php

declare(strict_types=1);

namespace App\Services\Exchange;

use App\Models\ExchangeRequest;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class ExchangeRequestService
{
    private const array LOAD_WITH = [
        'sender.profile',
        'receiver.profile',
        'teachingSkill.skill.categories',
        'learningSkill.skill.categories',
        'history.editedBy.profile',
    ];

    private const int DEFAULT_PER_PAGE = 20;

    private const int MAX_PER_PAGE = 50;

    private const array ACTIVE_STATUSES = ['pending', 'accepted'];

    public function list(User $user, array $params): LengthAwarePaginator
    {
        $role = $params['role'] ?? null;
        $status = $params['status'] ?? null;
        $perPage = $this->resolvePerPage($params['per_page'] ?? null);

        $query = ExchangeRequest::with(self::LOAD_WITH)
            ->where(function (Builder $query) use ($user): void {
                $query->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($role === 'sender') {
            $query->where('sender_id', $user->id);
        } elseif ($role === 'receiver') {
            $query->where('receiver_id', $user->id);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    public function create(User $sender, array $data): ExchangeRequest
    {
        return DB::transaction(function () use ($sender, $data): ExchangeRequest {
            $receiver = User::find($data['receiver_id']);

            if ($data['receiver_id'] === $sender->id) {
                throw new ExchangeRequestException('You cannot send an exchange request to yourself.');
            }

            if ($receiver === null) {
                throw new ExchangeRequestException('The specified user does not exist.');
            }

            $this->assertSenderEligible($sender, $data['teaching_skill_id'] ?? null);

            $this->assertReceiverEligible($receiver);

            if (isset($data['learning_skill_id']) && $data['learning_skill_id'] !== null) {
                $this->assertLearningSkillOwnedByReceiver((int) $data['learning_skill_id'], $receiver);
            }

            $this->assertAtLeastOneSkillProvided($data['teaching_skill_id'] ?? null, $data['learning_skill_id'] ?? null);

            $this->assertNoActiveSkillRequest($sender->id, $receiver->id, $data['learning_skill_id'] ?? null);

            $exchangeRequest = ExchangeRequest::create([
                'sender_id' => $sender->id,
                'receiver_id' => $receiver->id,
                'teaching_skill_id' => $data['teaching_skill_id'] ?? null,
                'learning_skill_id' => $data['learning_skill_id'] ?? null,
                'message' => $data['message'] ?? null,
                'status' => 'pending',
            ]);

            return $exchangeRequest->load(self::LOAD_WITH);
        });
    }

    public function accept(ExchangeRequest $exchangeRequest): ExchangeRequest
    {
        return DB::transaction(function () use ($exchangeRequest): ExchangeRequest {
            $affected = ExchangeRequest::query()
                ->where('id', $exchangeRequest->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'accepted',
                    'reconfirmation_required_by' => null,
                ]);

            if ($affected === 0) {
                throw new ExchangeRequestException('Only pending requests can be accepted.');
            }

            return $exchangeRequest->fresh(self::LOAD_WITH);
        });
    }

    public function update(User $editor, ExchangeRequest $exchangeRequest, array $data): ExchangeRequest
    {
        return DB::transaction(function () use ($editor, $exchangeRequest, $data): ExchangeRequest {
            if (! in_array($exchangeRequest->status, ['pending', 'accepted'], true)) {
                throw new ExchangeRequestException('Only pending or accepted requests can be edited.');
            }

            if ($exchangeRequest->status === 'pending' && $exchangeRequest->sender_id !== $editor->id) {
                throw new ExchangeRequestException('Only the sender can edit a pending request.');
            }

            $this->assertAtLeastOneSkillProvided($data['teaching_skill_id'] ?? null, $data['learning_skill_id'] ?? null);

            if (isset($data['teaching_skill_id']) && $data['teaching_skill_id'] !== null) {
                $this->assertTeachingSkillOwnedBySender((int) $data['teaching_skill_id'], $exchangeRequest->sender);
            }

            if (isset($data['learning_skill_id']) && $data['learning_skill_id'] !== null) {
                $this->assertLearningSkillOwnedByReceiver((int) $data['learning_skill_id'], $exchangeRequest->receiver);
            }

            $updates = [
                'teaching_skill_id' => $data['teaching_skill_id'] ?? null,
                'learning_skill_id' => $data['learning_skill_id'] ?? null,
                'message' => $data['message'] ?? null,
                'reconfirmation_required_by' => $editor->id === $exchangeRequest->sender_id
                    ? 'receiver'
                    : 'sender',
            ];

            if ($exchangeRequest->status === 'accepted') {
                $updates['status'] = 'pending';
            }

            $this->recordHistoryIfAccepted($exchangeRequest, $editor);

            $exchangeRequest->update($updates);

            return $exchangeRequest->fresh(self::LOAD_WITH);
        });
    }

    private function recordHistoryIfAccepted(ExchangeRequest $exchangeRequest, User $editor): void
    {
        if ($exchangeRequest->status !== 'accepted') {
            return;
        }

        $exchangeRequest->history()->create([
            'edited_by' => $editor->id,
            'teaching_skill_id' => $exchangeRequest->teaching_skill_id,
            'learning_skill_id' => $exchangeRequest->learning_skill_id,
            'message' => $exchangeRequest->message,
            'status' => $exchangeRequest->status,
        ]);
    }

    public function decline(ExchangeRequest $exchangeRequest): ExchangeRequest
    {
        return DB::transaction(function () use ($exchangeRequest): ExchangeRequest {
            $affected = ExchangeRequest::query()
                ->where('id', $exchangeRequest->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'declined',
                    'reconfirmation_required_by' => null,
                ]);

            if ($affected === 0) {
                throw new ExchangeRequestException('Only pending requests can be declined.');
            }

            return $exchangeRequest->fresh(self::LOAD_WITH);
        });
    }

    public function cancel(ExchangeRequest $exchangeRequest): ExchangeRequest
    {
        return DB::transaction(function () use ($exchangeRequest): ExchangeRequest {
            $affected = ExchangeRequest::query()
                ->where('id', $exchangeRequest->id)
                ->whereIn('status', ['pending', 'accepted'])
                ->update(['status' => 'cancelled']);

            if ($affected === 0) {
                throw new ExchangeRequestException('Only pending or accepted requests can be cancelled.');
            }

            return $exchangeRequest->fresh(self::LOAD_WITH);
        });
    }

    private function resolvePerPage(null|int|string $perPage): int
    {
        $perPage = $perPage ? (int) $perPage : self::DEFAULT_PER_PAGE;

        return min(max($perPage, 1), self::MAX_PER_PAGE);
    }

    private function assertSenderEligible(User $sender, ?int $teachingSkillId): void
    {
        if (! $sender->hasVerifiedEmail()) {
            throw new ExchangeRequestException('Your email must be verified to send exchange requests.');
        }

        if (! $this->hasProfileCompletionScore($sender)) {
            throw new ExchangeRequestException('Your profile must be at least 50% complete to send exchange requests.');
        }

        if ($teachingSkillId === null) {
            return;
        }

        $teachingSkill = UserSkill::query()
            ->where('id', $teachingSkillId)
            ->where('user_id', $sender->id)
            ->where('type', 'teaching')
            ->exists();

        if (! $teachingSkill) {
            throw new ExchangeRequestException('The teaching skill must belong to you and be of type teaching.');
        }
    }

    private function assertTeachingSkillOwnedBySender(?int $teachingSkillId, User $sender): void
    {
        if ($teachingSkillId === null) {
            return;
        }

        $teachingSkill = UserSkill::query()
            ->where('id', $teachingSkillId)
            ->where('user_id', $sender->id)
            ->where('type', 'teaching')
            ->exists();

        if (! $teachingSkill) {
            throw new ExchangeRequestException('The teaching skill must belong to you and be of type teaching.');
        }
    }

    private function assertReceiverEligible(User $receiver): void
    {
        if (! $receiver->hasVerifiedEmail()) {
            throw new ExchangeRequestException('This user is not eligible to receive exchange requests.');
        }

        if (! $this->hasProfileCompletionScore($receiver)) {
            throw new ExchangeRequestException('This user is not eligible to receive exchange requests.');
        }

        $hasAnySkill = $receiver->userSkills()->exists();

        if (! $hasAnySkill) {
            throw new ExchangeRequestException('This user is not eligible to receive exchange requests.');
        }
    }

    private function assertAtLeastOneSkillProvided(?int $teachingSkillId, ?int $learningSkillId): void
    {
        if ($teachingSkillId === null && $learningSkillId === null) {
            throw new ExchangeRequestException('Provide at least one skill for the exchange.');
        }
    }

    private function assertLearningSkillOwnedByReceiver(int $learningSkillId, User $receiver): void
    {
        $learningSkill = UserSkill::query()
            ->where('id', $learningSkillId)
            ->where('user_id', $receiver->id)
            ->where('type', 'teaching')
            ->exists();

        if (! $learningSkill) {
            throw new ExchangeRequestException('The learning skill must belong to the receiver and be of type teaching.');
        }
    }

    private function assertNoActiveSkillRequest(int $senderId, int $receiverId, ?int $learningSkillId): void
    {
        if ($learningSkillId === null) {
            return;
        }

        $skillId = UserSkill::query()
            ->where('id', $learningSkillId)
            ->value('skill_id');

        if ($skillId === null) {
            return;
        }

        $exists = ExchangeRequest::query()
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->where('sender_id', $senderId)
            ->where('receiver_id', $receiverId)
            ->whereNotNull('learning_skill_id')
            ->whereHas('learningSkill', function (Builder $query) use ($skillId): void {
                $query->where('skill_id', $skillId);
            })
            ->exists();

        if ($exists) {
            throw new ExchangeRequestException('You already have an active exchange with this user for this skill.');
        }
    }

    private function hasProfileCompletionScore(User $user): bool
    {
        return DB::table('users')
            ->join('profiles', 'users.id', '=', 'profiles.user_id')
            ->where('users.id', $user->id)
            ->whereRaw(Profile::completionScoreSql())
            ->exists();
    }
}
