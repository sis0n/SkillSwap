<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teaching_skill_id')->constrained('user_skills')->cascadeOnDelete();
            $table->foreignId('learning_skill_id')->constrained('user_skills')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('sender_id');
            $table->index('receiver_id');
            $table->index('teaching_skill_id');
            $table->index('learning_skill_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_requests');
    }
};
