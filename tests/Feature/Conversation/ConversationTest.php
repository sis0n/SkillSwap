<?php

declare(strict_types=1);

namespace Tests\Feature\Conversation;

use App\Models\Conversation;
use App\Models\ExchangeRequest;
use App\Models\Message;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ConversationTest extends TestCase
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

    private function createPendingRequest(User $sender, User $receiver): ExchangeRequest
    {
        return ExchangeRequest::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => null,
            'learning_skill_id' => null,
            'message' => null,
            'status' => 'pending',
        ]);
    }

    private function createConversation(User $sender, User $receiver, array $overrides = []): Conversation
    {
        $exchangeRequest = ExchangeRequest::factory()->create(array_merge([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => null,
            'learning_skill_id' => null,
            'message' => null,
            'status' => 'accepted',
        ], $overrides['exchange_request'] ?? []));

        return Conversation::factory()->create([
            'exchange_request_id' => $exchangeRequest->id,
        ]);
    }

    private function createMessage(Conversation $conversation, User $sender, string $body, array $overrides = []): Message
    {
        return Message::factory()->create(array_merge([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'body' => $body,
            'read_at' => null,
        ], $overrides));
    }

    // ---------------------------------------------------------------
    // Authentication
    // ---------------------------------------------------------------

    public function test_guest_cannot_list_conversations(): void
    {
        $this->getJson('/api/v1/conversations')->assertStatus(401);
    }

    public function test_guest_cannot_show_conversation(): void
    {
        $this->getJson('/api/v1/conversations/1')->assertStatus(401);
    }

    public function test_guest_cannot_list_messages(): void
    {
        $this->getJson('/api/v1/conversations/1/messages')->assertStatus(401);
    }

    public function test_guest_cannot_send_message(): void
    {
        $this->postJson('/api/v1/conversations/1/messages')->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Conversation creation on acceptance
    // ---------------------------------------------------------------

    public function test_no_conversation_exists_before_acceptance(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $this->createPendingRequest($sender, $receiver);

        $this->assertDatabaseCount('conversations', 0);
    }

    public function test_accepting_pending_request_creates_conversation_with_zero_messages(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $exchangeRequest = $this->createPendingRequest($sender, $receiver);

        $response = $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept");

        $response->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'accepted');

        $this->assertDatabaseHas('conversations', [
            'exchange_request_id' => $exchangeRequest->id,
        ]);
        $this->assertDatabaseCount('conversations', 1);
        $this->assertDatabaseCount('messages', 0);
    }

    public function test_declining_does_not_create_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $exchangeRequest = $this->createPendingRequest($sender, $receiver);

        $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/decline")
            ->assertStatus(200);

        $this->assertDatabaseCount('conversations', 0);
    }

    public function test_re_acceptance_after_edit_reopen_does_not_duplicate_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $teachingSkill = $this->createUserSkill($sender, 'teaching');
        $learningSkill = $this->createUserSkill($receiver, 'teaching');

        $exchangeRequest = ExchangeRequest::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => $teachingSkill->id,
            'learning_skill_id' => $learningSkill->id,
            'message' => 'Let us learn together!',
            'status' => 'accepted',
        ]);

        $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}", [
                'teaching_skill_id' => $teachingSkill->id,
                'learning_skill_id' => $learningSkill->id,
                'message' => 'Updated proposal.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'pending');

        $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept")
            ->assertStatus(200)
            ->assertJsonPath('data.exchange_request.status', 'accepted');

        $this->assertDatabaseCount('conversations', 1);
    }

    public function test_accepting_already_accepted_request_creates_exactly_one_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $exchangeRequest = $this->createPendingRequest($sender, $receiver);

        $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept")
            ->assertStatus(200);

        $this->actingAs($receiver)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/accept")
            ->assertStatus(422);

        $this->assertDatabaseCount('conversations', 1);
    }

    // ---------------------------------------------------------------
    // List
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_list_own_conversations(): void
    {
        $user = $this->createEligibleUser();
        $other = $this->createEligibleUser();
        $this->createConversation($user, $other);

        $response = $this->actingAs($user)->getJson('/api/v1/conversations');

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Conversations retrieved.')
            ->assertJsonCount(1, 'data.conversations')
            ->assertJsonStructure([
                'data' => [
                    'conversations' => [
                        '*' => [
                            'id', 'exchange_request_id', 'other_user',
                            'last_message', 'unread_count', 'updated_at',
                        ],
                    ],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_conversation_appears_in_both_participants_lists(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $senderList = $this->actingAs($sender)->getJson('/api/v1/conversations');
        $receiverList = $this->actingAs($receiver)->getJson('/api/v1/conversations');

        $senderList->assertStatus(200)->assertJsonCount(1, 'data.conversations')
            ->assertJsonPath('data.conversations.0.id', $conversation->id)
            ->assertJsonPath('data.conversations.0.other_user.id', $receiver->id);

        $receiverList->assertStatus(200)->assertJsonCount(1, 'data.conversations')
            ->assertJsonPath('data.conversations.0.id', $conversation->id)
            ->assertJsonPath('data.conversations.0.other_user.id', $sender->id);
    }

    public function test_list_excludes_conversations_user_is_not_part_of(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $stranger = $this->createEligibleUser();
        $this->createConversation($sender, $receiver);

        $this->actingAs($stranger)->getJson('/api/v1/conversations')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data.conversations');
    }

    public function test_list_orders_by_updated_at_desc(): void
    {
        $user = $this->createEligibleUser();
        $otherA = $this->createEligibleUser();
        $otherB = $this->createEligibleUser();

        $older = $this->createConversation($user, $otherA);
        $newer = $this->createConversation($user, $otherB);

        DB::table('conversations')->where('id', $older->id)->update(['updated_at' => now()->subMinutes(5)]);
        DB::table('conversations')->where('id', $newer->id)->update(['updated_at' => now()->subMinutes(1)]);

        $response = $this->actingAs($user)->getJson('/api/v1/conversations');

        $response->assertStatus(200);
        $this->assertSame(
            [$newer->id, $older->id],
            array_column($response->json('data.conversations'), 'id')
        );
    }

    public function test_list_returns_last_message_summary(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $sender, 'first message');
        $latest = $this->createMessage($conversation, $receiver, 'latest reply');

        $response = $this->actingAs($sender)->getJson('/api/v1/conversations');

        $response->assertStatus(200)
            ->assertJsonPath('data.conversations.0.last_message.id', $latest->id)
            ->assertJsonPath('data.conversations.0.last_message.body', 'latest reply');
    }

    public function test_list_does_not_embed_the_message_thread(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $sender, 'one');
        $this->createMessage($conversation, $sender, 'two');

        $response = $this->actingAs($sender)->getJson('/api/v1/conversations');

        $response->assertStatus(200);
        $conversationPayload = $response->json('data.conversations.0');
        $this->assertArrayNotHasKey('messages', $conversationPayload);
    }

    public function test_empty_conversation_appears_in_list_with_null_last_message(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $this->createConversation($sender, $receiver);

        $response = $this->actingAs($sender)->getJson('/api/v1/conversations');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.conversations')
            ->assertJsonPath('data.conversations.0.last_message', null)
            ->assertJsonPath('data.conversations.0.unread_count', 0);
    }

    public function test_list_paginates(): void
    {
        $user = $this->createEligibleUser();

        for ($i = 0; $i < 5; $i++) {
            $this->createConversation($user, $this->createEligibleUser());
        }

        $response = $this->actingAs($user)->getJson('/api/v1/conversations?per_page=2&page=1');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.conversations')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 3);
    }

    public function test_list_clamps_per_page_to_maximum(): void
    {
        $user = $this->createEligibleUser();

        for ($i = 0; $i < 60; $i++) {
            $this->createConversation($user, $this->createEligibleUser());
        }

        $response = $this->actingAs($user)->getJson('/api/v1/conversations?per_page=100');

        $response->assertStatus(200)
            ->assertJsonPath('meta.per_page', 50);
    }

    // ---------------------------------------------------------------
    // Show
    // ---------------------------------------------------------------

    public function test_sender_can_view_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($sender)
            ->getJson("/api/v1/conversations/{$conversation->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Conversation retrieved.')
            ->assertJsonPath('data.conversation.id', $conversation->id)
            ->assertJsonPath('data.conversation.exchange_request_id', $conversation->exchange_request_id)
            ->assertJsonPath('data.conversation.other_user.id', $receiver->id);
    }

    public function test_receiver_can_view_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($receiver)
            ->getJson("/api/v1/conversations/{$conversation->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.conversation.other_user.id', $sender->id);
    }

    public function test_non_participant_cannot_view_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $stranger = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($stranger)
            ->getJson("/api/v1/conversations/{$conversation->id}");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You are not part of this conversation.');
    }

    public function test_show_returns_404_for_missing_conversation(): void
    {
        $user = $this->createEligibleUser();

        $this->actingAs($user)->getJson('/api/v1/conversations/99999')->assertStatus(404);
    }

    // ---------------------------------------------------------------
    // Messages — list
    // ---------------------------------------------------------------

    public function test_participant_can_list_messages_in_ascending_order(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $this->createMessage($conversation, $sender, 'third', ['created_at' => now()->subMinutes(1)]);
        $this->createMessage($conversation, $sender, 'first', ['created_at' => now()->subMinutes(3)]);
        $this->createMessage($conversation, $sender, 'second', ['created_at' => now()->subMinutes(2)]);

        $response = $this->actingAs($sender)->getJson("/api/v1/conversations/{$conversation->id}/messages");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Messages retrieved.')
            ->assertJsonCount(3, 'data.messages')
            ->assertJsonStructure([
                'data' => [
                    'messages' => [
                        '*' => [
                            'id', 'conversation_id', 'sender_id', 'sender',
                            'body', 'read_at', 'created_at',
                        ],
                    ],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $bodies = array_column($response->json('data.messages'), 'body');
        $this->assertSame(['first', 'second', 'third'], $bodies);
    }

    public function test_messages_use_id_as_tie_breaker_when_created_at_collides(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $this->createMessage($conversation, $sender, 'beta', ['created_at' => '2026-01-01 00:00:00']);
        $this->createMessage($conversation, $sender, 'alpha', ['created_at' => '2026-01-01 00:00:00']);

        $response = $this->actingAs($sender)->getJson("/api/v1/conversations/{$conversation->id}/messages");

        $bodies = array_column($response->json('data.messages'), 'body');
        $this->assertSame(['beta', 'alpha'], $bodies);
    }

    public function test_empty_conversation_returns_empty_message_list(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($sender)->getJson("/api/v1/conversations/{$conversation->id}/messages");

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.messages')
            ->assertJsonPath('meta.total', 0);
    }

    public function test_non_participant_cannot_list_messages(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $stranger = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($stranger)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You are not part of this conversation.');
    }

    public function test_messages_paginate(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        for ($i = 0; $i < 5; $i++) {
            $this->createMessage($conversation, $sender, "message {$i}");
        }

        $response = $this->actingAs($sender)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages?per_page=2&page=1");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.messages')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.last_page', 3);
    }

    // ---------------------------------------------------------------
    // Messages — send
    // ---------------------------------------------------------------

    public function test_participant_can_send_message(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'Hello!',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Message sent.')
            ->assertJsonPath('data.message.body', 'Hello!')
            ->assertJsonPath('data.message.conversation_id', $conversation->id)
            ->assertJsonPath('data.message.sender_id', $sender->id)
            ->assertJsonPath('data.message.read_at', null);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'body' => 'Hello!',
            'read_at' => null,
        ]);
    }

    public function test_send_trims_message_body(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => '   Hello there!   ',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.message.body', 'Hello there!');

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'body' => 'Hello there!',
        ]);
    }

    public function test_send_rejects_empty_body(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [])
            ->assertStatus(422);

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_send_rejects_whitespace_only_body(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => '     ',
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_send_rejects_body_over_2000_characters(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => str_repeat('a', 2001),
            ])
            ->assertStatus(422);

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_non_participant_cannot_send_message(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $stranger = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $response = $this->actingAs($stranger)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'Hello!',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'You are not part of this conversation.');

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_sending_a_message_updates_conversation_updated_at(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        DB::table('conversations')->where('id', $conversation->id)->update([
            'updated_at' => now()->subHour(),
        ]);

        $before = DB::table('conversations')->where('id', $conversation->id)->value('updated_at');

        $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'Bump!',
            ])
            ->assertStatus(201);

        $after = DB::table('conversations')->where('id', $conversation->id)->value('updated_at');

        $this->assertNotSame($before, $after);
    }

    public function test_failed_message_write_leaves_conversation_unchanged(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $receiver, 'unread from receiver');

        DB::table('conversations')->where('id', $conversation->id)->update([
            'updated_at' => '2026-01-01 00:00:00',
        ]);
        $before = DB::table('conversations')->where('id', $conversation->id)->value('updated_at');

        $this->actingAs($sender)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => '   ',
            ])
            ->assertStatus(422);

        $after = DB::table('conversations')->where('id', $conversation->id)->value('updated_at');

        $this->assertSame($before, $after);
        $this->assertDatabaseCount('messages', 1);
    }

    // ---------------------------------------------------------------
    // Read tracking
    // ---------------------------------------------------------------

    public function test_retrieving_message_list_marks_unread_incoming_messages_as_read(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $sender, 'hello');
        $this->createMessage($conversation, $sender, 'how are you');

        $response = $this->actingAs($receiver)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'read_at' => null,
        ]);

        $this->assertTrue(
            Message::where('conversation_id', $conversation->id)->get()
                ->every(fn (Message $message) => $message->read_at !== null)
        );
    }

    public function test_read_tracking_marks_every_unread_incoming_message_across_all_pages(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        for ($i = 0; $i < 5; $i++) {
            $this->createMessage($conversation, $sender, "message {$i}");
        }

        $this->actingAs($receiver)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages?per_page=2&page=1")
            ->assertStatus(200);

        $this->assertTrue(
            Message::where('conversation_id', $conversation->id)->get()
                ->every(fn (Message $message) => $message->read_at !== null)
        );
    }

    public function test_read_tracking_never_marks_authenticated_users_own_messages(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $own = $this->createMessage($conversation, $receiver, 'my own message');
        $incoming = $this->createMessage($conversation, $sender, 'incoming message');

        $this->actingAs($receiver)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages")
            ->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $own->id,
            'sender_id' => $receiver->id,
            'read_at' => null,
        ]);
        $this->assertDatabaseMissing('messages', [
            'id' => $incoming->id,
            'sender_id' => $sender->id,
            'read_at' => null,
        ]);
        $this->assertNull($this->readAt($own->id));
        $this->assertNotNull($this->readAt($incoming->id));
    }

    public function test_read_tracking_is_no_op_on_empty_conversation(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);

        $this->actingAs($receiver)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages")
            ->assertStatus(200)
            ->assertJsonCount(0, 'data.messages');

        $this->assertDatabaseCount('messages', 0);
    }

    public function test_listing_conversations_does_not_trigger_read_tracking(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $message = $this->createMessage($conversation, $sender, 'unread incoming');

        $this->actingAs($receiver)->getJson('/api/v1/conversations')->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'read_at' => null,
        ]);
    }

    public function test_sending_does_not_trigger_read_tracking(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $incoming = $this->createMessage($conversation, $sender, 'unread incoming');

        $this->actingAs($receiver)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'my reply',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('messages', [
            'id' => $incoming->id,
            'read_at' => null,
        ]);
    }

    public function test_unread_count_reflects_unread_messages_from_other_participant(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $sender, 'one');
        $this->createMessage($conversation, $sender, 'two');
        $this->createMessage($conversation, $sender, 'three');

        $response = $this->actingAs($receiver)->getJson('/api/v1/conversations');

        $response->assertStatus(200)
            ->assertJsonPath('data.conversations.0.unread_count', 3);
    }

    public function test_unread_count_drops_to_zero_after_reading(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $sender, 'hello');

        $before = $this->actingAs($receiver)->getJson('/api/v1/conversations');
        $before->assertJsonPath('data.conversations.0.unread_count', 1);

        $this->actingAs($receiver)
            ->getJson("/api/v1/conversations/{$conversation->id}/messages")
            ->assertStatus(200);

        $after = $this->actingAs($receiver)->getJson('/api/v1/conversations');
        $after->assertStatus(200)
            ->assertJsonPath('data.conversations.0.unread_count', 0);
    }

    // ---------------------------------------------------------------
    // Lifecycle & cascade
    // ---------------------------------------------------------------

    public function test_conversation_persists_when_exchange_request_is_cancelled(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $exchangeRequest = ExchangeRequest::factory()->create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'teaching_skill_id' => null,
            'learning_skill_id' => null,
            'message' => null,
            'status' => 'accepted',
        ]);
        $conversation = Conversation::factory()->create([
            'exchange_request_id' => $exchangeRequest->id,
        ]);

        $this->actingAs($sender)
            ->putJson("/api/v1/me/exchange-requests/{$exchangeRequest->id}/cancel")
            ->assertStatus(200);

        $this->assertDatabaseHas('conversations', ['id' => $conversation->id]);
    }

    public function test_deleting_exchange_request_cascades_conversation_and_messages(): void
    {
        $sender = $this->createEligibleUser();
        $receiver = $this->createEligibleUser();
        $conversation = $this->createConversation($sender, $receiver);
        $this->createMessage($conversation, $sender, 'one');
        $this->createMessage($conversation, $receiver, 'two');

        $conversation->exchangeRequest->delete();

        $this->assertDatabaseMissing('conversations', ['id' => $conversation->id]);
        $this->assertDatabaseCount('messages', 0);
    }

    private function readAt(int $messageId): ?string
    {
        return DB::table('messages')->where('id', $messageId)->value('read_at');
    }
}
