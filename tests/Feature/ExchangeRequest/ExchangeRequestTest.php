<?php

declare(strict_types=1);

namespace Tests\Feature\ExchangeRequest;

use App\Models\ExchangeRequest;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExchangeRequestTest extends TestCase
{
    use RefreshDatabase;

    private function createEligibleUser(array $overrides = []): User
    {
        $user = User::factory()->create(array_merge([
            'email_verified_at' => now(),
        ], $overrides));

        Profile::factory()->create([
            'user_id' => $user->id,
            'avatar' => 'avatars/test.jpg',
            'headline' => 'Test Headline',
            'bio' => 'Test bio description.',
            'location' => 'Test City',
            'timezone' => 'UTC',
            'experience_level' => 'intermediate',
        ]);

        return $user;
    }

    private function createUserSkill(User $user, string $type, array $overrides = []): UserSkill
    {
        return UserSkill::factory()->create(array_merge([
            'user_id' => $user->id,
            'type' => $type,
        ], $overrides));
    }

    private function createRequest(
        User $sender,
        User $receiver,
        UserSkill $teachingSkill,
        ?UserSkill $learningSkill = null,
        string $status = 'pending',
        array $overrides = [],
    ): ExchangeRequest {
        return ExchangeRequest::factory()->create(array_merge([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => $teachingSkill->id,
            'learning_skill_id' => $learningSkill?->id,
            'status' => $status,
            'message' => 'Let us learn together!',
        ], $overrides));
    }

    private function validCreatePayload(
        User $sender,
        User $receiver,
        UserSkill $teachingSkill,
        ?UserSkill $learningSkill = null,
        array $overrides = [],
    ): array {
        return array_merge([
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => $teachingSkill->id,
            'learning_skill_id' => $learningSkill?->id,
            'message' => 'Let us learn together!',
        ], $overrides);
    }

    // ---------------------------------------------------------------
    // Authentication
    // ---------------------------------------------------------------

    public function test_guest_cannot_list_exchange_requests(): void
    {
        $this->getJson('/api/v1/me/exchange-requests')->assertStatus(401);
    }

    public function test_guest_cannot_create_exchange_request(): void
    {
        $this->postJson('/api/v1/me/exchange-requests')->assertStatus(401);
    }

    public function test_guest_cannot_show_exchange_request(): void
    {
        $this->getJson('/api/v1/me/exchange-requests/1')->assertStatus(401);
    }

    public function test_guest_cannot_accept_exchange_request(): void
    {
        $this->putJson('/api/v1/me/exchange-requests/1/accept')->assertStatus(401);
    }

    public function test_guest_cannot_decline_exchange_request(): void
    {
        $this->putJson('/api/v1/me/exchange-requests/1/decline')->assertStatus(401);
    }

    public function test_guest_cannot_cancel_exchange_request(): void
    {
        $this->putJson('/api/v1/me/exchange-requests/1/cancel')->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Create — validation
    // ---------------------------------------------------------------

    public function test_can_create_exchange_request_with_learning_skill(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $learningSkill = $this->createUserSkill($receiver, 'learning');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, $learningSkill));

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Exchange request sent.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'exchange_request' => [
                        'id', 'sender', 'receiver', 'teaching_skill', 'learning_skill',
                        'message', 'status', 'created_at', 'updated_at',
                    ],
                ],
            ])
            ->assertJsonPath('data.exchange_request.status', 'pending')
            ->assertJsonPath('data.exchange_request.message', 'Let us learn together!');

        $this->assertDatabaseHas('exchange_requests', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => $teachingSkill->id,
            'learning_skill_id' => $learningSkill->id,
            'status' => 'pending',
        ]);
    }

    public function test_can_create_one_way_exchange_request_without_learning_skill(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $this->createUserSkill($receiver, 'learning');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(201)
            ->assertJsonPath('data.exchange_request.learning_skill', null);

        $this->assertDatabaseHas('exchange_requests', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'learning_skill_id' => null,
        ]);
    }

    public function test_create_validates_required_fields(): void
    {
        $sender = $this->createEligibleUser();

        $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', [])
            ->assertStatus(422);
    }

    public function test_create_rejects_self_request(): void
    {
        $sender = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $sender, $teachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'You cannot send an exchange request to yourself.');
    }

    public function test_create_rejects_teaching_skill_not_owned_by_sender(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $otherTeachingSkill = $this->createUserSkill($other, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $otherTeachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The teaching skill must belong to you and be of type teaching.');
    }

    public function test_create_rejects_teaching_skill_with_wrong_type(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $senderLearningSkill = $this->createUserSkill($sender, 'learning');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $senderLearningSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The teaching skill must belong to you and be of type teaching.');
    }

    public function test_create_rejects_learning_skill_not_owned_by_receiver(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $this->createUserSkill($receiver, 'learning');
        $other = $this->createEligibleUser();
        $otherLearningSkill = $this->createUserSkill($other, 'learning');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, $otherLearningSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The learning skill must belong to the receiver and be of type learning.');
    }

    public function test_create_rejects_learning_skill_with_wrong_type(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $receiverTeachingSkill = $this->createUserSkill($receiver, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, $receiverTeachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The learning skill must belong to the receiver and be of type learning.');
    }

    public function test_create_rejects_message_over_500_characters(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, overrides: [
                'message' => str_repeat('a', 501),
            ]));

        $response->assertStatus(422);
    }

    public function test_create_trims_message_whitespace_and_stores_empty_as_null(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $this->createUserSkill($receiver, 'learning');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, overrides: [
                'message' => '   Let us learn together!   ',
            ]));

        $response->assertStatus(201)
            ->assertJsonPath('data.exchange_request.message', 'Let us learn together!');

        $whitespaceReceiver = $this->createEligibleUser();
        $this->createUserSkill($whitespaceReceiver, 'learning');

        $whitespaceResponse = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $whitespaceReceiver, $teachingSkill, overrides: [
                'message' => '   ',
            ]));

        $whitespaceResponse->assertStatus(201)
            ->assertJsonPath('data.exchange_request.message', null);
    }

    public function test_create_rejects_sender_with_unverified_email(): void
    {
        $sender = User::factory()->unverified()->create();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Your email must be verified to send exchange requests.');
    }

    public function test_create_rejects_sender_with_incomplete_profile(): void
    {
        $sender = User::factory()->create(['email_verified_at' => now()]);
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Your profile must be at least 50% complete to send exchange requests.');
    }

    public function test_create_rejects_receiver_with_unverified_email(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = User::factory()->unverified()->create();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'This user is not eligible to receive exchange requests.');
    }

    public function test_create_rejects_receiver_with_incomplete_profile(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = User::factory()->create(['email_verified_at' => now()]);
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $receiverSkill = $this->createUserSkill($receiver, 'learning');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, $receiverSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'This user is not eligible to receive exchange requests.');
    }

    public function test_create_rejects_receiver_with_no_skills(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'This user is not eligible to receive exchange requests.');
    }

    // ---------------------------------------------------------------
    // Create — duplicate guard
    // ---------------------------------------------------------------

    public function test_create_blocks_duplicate_active_request_same_direction(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $learningSkill = $this->createUserSkill($receiver, 'learning');
        $this->createRequest($sender, $receiver, $teachingSkill, $learningSkill);

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, $learningSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'An active exchange request already exists between you and this user.');
    }

    public function test_create_blocks_duplicate_active_request_opposite_direction(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $learningSkill = $this->createUserSkill($receiver, 'learning');
        $this->createRequest($receiver, $sender, $learningSkill, $teachingSkill);

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill, $learningSkill));

        $response->assertStatus(422)
            ->assertJsonPath('message', 'An active exchange request already exists between you and this user.');
    }

    public function test_create_allows_new_request_after_previous_is_declined(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $this->createUserSkill($receiver, 'learning');
        $this->createRequest($sender, $receiver, $teachingSkill, status: 'declined');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(201);
    }

    public function test_create_allows_new_request_after_previous_is_cancelled(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $this->createUserSkill($receiver, 'learning');
        $this->createRequest($sender, $receiver, $teachingSkill, status: 'cancelled');

        $response = $this->actingAs($sender)
            ->postJson('/api/v1/me/exchange-requests', $this->validCreatePayload($sender, $receiver, $teachingSkill));

        $response->assertStatus(201);
    }

    // ---------------------------------------------------------------
    // List
    // ---------------------------------------------------------------

    public function test_list_returns_requests_where_user_is_sender_or_receiver(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($user, 'teaching');
        $otherTeachingSkill = $this->createUserSkill($other, 'teaching');

        $sent = $this->createRequest($user, $other, $teachingSkill);
        $received = $this->createRequest($other, $user, $otherTeachingSkill);
        $unrelated = $this->createEligibleUser();
        $unrelatedReceiver = $this->createEligibleUser();
        $unrelatedTeaching = $this->createUserSkill($unrelated, 'teaching');
        $this->createRequest($unrelated, $unrelatedReceiver, $unrelatedTeaching);

        $response = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Exchange requests retrieved.')
            ->assertJsonCount(2, 'data.exchange_requests')
            ->assertJsonStructure([
                'data' => [
                    'exchange_requests' => [
                        '*' => [
                            'id', 'sender', 'receiver', 'teaching_skill', 'learning_skill',
                            'message', 'status', 'created_at', 'updated_at',
                        ],
                    ],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertSame(
            [$received->id, $sent->id],
            array_column($response->json('data.exchange_requests'), 'id')
        );
    }

    public function test_list_orders_by_created_at_desc_then_id_desc(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($user, 'teaching');

        $this->createRequest($user, $other, $teachingSkill, overrides: ['created_at' => now()->subMinutes(3)]);
        $this->createRequest($user, $other, $teachingSkill, overrides: ['created_at' => now()->subMinutes(1)]);
        $this->createRequest($user, $other, $teachingSkill, overrides: ['created_at' => now()->subMinutes(2)]);

        $response = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests');

        $response->assertStatus(200);
        $createdAts = collect($response->json('data.exchange_requests'))->pluck('created_at')->all();
        $sorted = $createdAts;
        rsort($sorted);

        $this->assertSame($sorted, $createdAts);
    }

    public function test_list_filters_by_role(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($user, 'teaching');
        $otherTeachingSkill = $this->createUserSkill($other, 'teaching');

        $this->createRequest($user, $other, $teachingSkill);
        $this->createRequest($other, $user, $otherTeachingSkill);

        $sent = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests?role=sender');
        $received = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests?role=receiver');

        $sent->assertStatus(200)->assertJsonCount(1, 'data.exchange_requests');
        $received->assertStatus(200)->assertJsonCount(1, 'data.exchange_requests');
    }

    public function test_list_filters_by_status(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($user, 'teaching');

        $this->createRequest($user, $other, $teachingSkill, status: 'pending');
        $this->createRequest($user, $other, $teachingSkill, status: 'accepted');

        $response = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests?status=accepted');

        $response->assertStatus(200)->assertJsonCount(1, 'data.exchange_requests')
            ->assertJsonPath('data.exchange_requests.0.status', 'accepted');
    }

    public function test_list_paginates(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($user, 'teaching');

        for ($i = 0; $i < 5; $i++) {
            $this->createRequest($user, $other, $teachingSkill);
        }

        $response = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests?per_page=2&page=1');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.exchange_requests')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 3);
    }

    public function test_list_clamps_per_page_to_maximum(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($user, 'teaching');

        for ($i = 0; $i < 60; $i++) {
            $this->createRequest($user, $other, $teachingSkill);
        }

        $response = $this->actingAs($user)->getJson('/api/v1/me/exchange-requests?per_page=100');

        $response->assertStatus(200)
            ->assertJsonPath('meta.per_page', 50);
    }

    // ---------------------------------------------------------------
    // Show
    // ---------------------------------------------------------------

    public function test_sender_can_view_exchange_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($sender)
            ->getJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.id', $exchangeRequest->id)
            ->assertJsonPath('data.exchange_request.status', 'pending');
    }

    public function test_receiver_can_view_exchange_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($receiver)
            ->getJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.id', $exchangeRequest->id);
    }

    public function test_non_party_cannot_view_exchange_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $stranger = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($stranger)
            ->getJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You are not part of this exchange request.');
    }

    public function test_show_returns_404_for_missing_request(): void
    {
        $user = $this->createEligibleUser();

        $this->actingAs($user)
            ->getJson('/api/v1/me/exchange-requests/99999')
            ->assertStatus(404);
    }

    // ---------------------------------------------------------------
    // Accept
    // ---------------------------------------------------------------

    public function test_receiver_can_accept_pending_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'accepted')
            ->assertJsonPath('message', 'Exchange request accepted.');

        $this->assertDatabaseHas('exchange_requests', [
            'id' => $exchangeRequest->id,
            'status' => 'accepted',
        ]);
    }

    public function test_sender_cannot_accept_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Only the receiver can accept this request.');
    }

    public function test_non_party_cannot_accept_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $stranger = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($stranger)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You are not part of this exchange request.');
    }

    public function test_accept_non_pending_request_returns_422(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill, status: 'declined');

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Only pending requests can be accepted.');
    }

    public function test_accept_already_accepted_request_returns_422(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill, status: 'accepted');

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Only pending requests can be accepted.');
    }

    // ---------------------------------------------------------------
    // Decline
    // ---------------------------------------------------------------

    public function test_receiver_can_decline_pending_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/decline");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'declined')
            ->assertJsonPath('message', 'Exchange request declined.');

        $this->assertDatabaseHas('exchange_requests', [
            'id' => $exchangeRequest->id,
            'status' => 'declined',
        ]);
    }

    public function test_sender_cannot_decline_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/decline");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Only the receiver can decline this request.');
    }

    public function test_decline_accepted_request_returns_422(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill, status: 'accepted');

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/decline");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Only pending requests can be declined.');
    }

    // ---------------------------------------------------------------
    // Cancel
    // ---------------------------------------------------------------

    public function test_sender_can_cancel_pending_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'cancelled')
            ->assertJsonPath('message', 'Exchange request cancelled.');

        $this->assertDatabaseHas('exchange_requests', [
            'id' => $exchangeRequest->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_sender_can_cancel_accepted_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill, status: 'accepted');

        $response = $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'cancelled');
    }

    public function test_receiver_cannot_cancel_request(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill);

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/cancel");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Only the sender can cancel this request.');
    }

    public function test_cancel_declined_request_returns_422(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill, status: 'declined');

        $response = $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/cancel");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Only pending or accepted requests can be cancelled.');
    }

    public function test_cancel_cancelled_request_returns_422(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $exchangeRequest = $this->createRequest($sender, $receiver, $teachingSkill, status: 'cancelled');

        $response = $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/cancel");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Only pending or accepted requests can be cancelled.');
    }
}
