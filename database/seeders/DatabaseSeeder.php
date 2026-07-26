<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\ExchangeRequest;
use App\Models\LearningSession;
use App\Models\Message;
use App\Models\Profile;
use App\Models\Review;
use App\Models\Role;
use App\Models\SessionResource;
use App\Models\User;
use App\Models\UserAvailability;
use App\Models\UserSkill;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SkillCategorySeeder::class,
            LanguageSeeder::class,
        ]);

        $users = User::factory(10)->create();

        foreach ($users as $user) {
            Profile::factory()->create(['user_id' => $user->id]);
            UserAvailability::factory(3)->create(['user_id' => $user->id]);
        }

        $teachingPools = [
            'PHP', 'JavaScript', 'Guitar', 'Piano', 'English', 'Spanish',
            'Graphic Design', 'Figma', 'Social Media Marketing', 'Creative Writing',
        ];

        $learningPools = [
            'Laravel', 'React', 'Python', 'Photography', 'Video Editing',
            'Cooking', 'Yoga', 'Public Speaking', 'Chess', 'Gardening',
        ];

        foreach ($users as $user) {
            $teachName = $teachingPools[array_rand($teachingPools)];
            $learnName = $learningPools[array_rand($learningPools)];

            $teachSkill = \App\Models\Skill::where('name', $teachName)->first();
            $learnSkill = \App\Models\Skill::where('name', $learnName)->first();

            if ($teachSkill) {
                UserSkill::factory()->create([
                    'user_id' => $user->id,
                    'skill_id' => $teachSkill->id,
                    'type' => 'teaching',
                ]);
            }

            if ($learnSkill) {
                UserSkill::factory()->create([
                    'user_id' => $user->id,
                    'skill_id' => $learnSkill->id,
                    'type' => 'learning',
                ]);
            }
        }

        $userIds = $users->pluck('id')->toArray();

        for ($i = 0; $i < 5; $i++) {
            $senderId = $userIds[array_rand($userIds)];
            $receiverId = $userIds[array_rand($userIds)];

            if ($senderId === $receiverId) {
                continue;
            }

            $senderTeaching = UserSkill::where('user_id', $senderId)
                ->where('type', 'teaching')->first();

            $receiverLearning = UserSkill::where('user_id', $receiverId)
                ->where('type', 'learning')->first();

            if (!$senderTeaching || !$receiverLearning) {
                continue;
            }

            $exchangeRequest = ExchangeRequest::factory()->create([
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
                'teaching_skill_id' => $senderTeaching->id,
                'learning_skill_id' => $receiverLearning->id,
                'status' => fake()->randomElement(['pending', 'accepted', 'completed']),
            ]);

            if (in_array($exchangeRequest->status, ['accepted', 'completed'])) {
                $conversation = Conversation::factory()->create([
                    'exchange_request_id' => $exchangeRequest->id,
                ]);

                Message::factory(3)->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $senderId,
                ]);

                Message::factory(2)->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $receiverId,
                ]);

                if ($exchangeRequest->status === 'completed') {
                    $learningSession = LearningSession::factory()->create([
                        'exchange_request_id' => $exchangeRequest->id,
                        'status' => 'completed',
                    ]);

                    SessionResource::factory(2)->create([
                        'learning_session_id' => $learningSession->id,
                    ]);

                    Review::factory()->create([
                        'learning_session_id' => $learningSession->id,
                        'reviewer_id' => $senderId,
                        'reviewee_id' => $receiverId,
                    ]);

                    Review::factory()->create([
                        'learning_session_id' => $learningSession->id,
                        'reviewer_id' => $receiverId,
                        'reviewee_id' => $senderId,
                    ]);
                }
            }
        }
    }
}
