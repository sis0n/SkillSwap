<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_request_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('edited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('teaching_skill_id')->nullable()->constrained('user_skills')->nullOnDelete();
            $table->foreignId('learning_skill_id')->nullable()->constrained('user_skills')->nullOnDelete();
            $table->text('message')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            $table->index('exchange_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_request_history');
    }
};