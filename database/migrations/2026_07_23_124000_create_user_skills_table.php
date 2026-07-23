<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('experience_level')->default('beginner');
            $table->integer('years_of_experience')->default(0);
            $table->string('teaching_style')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('skill_id');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_skills');
    }
};
