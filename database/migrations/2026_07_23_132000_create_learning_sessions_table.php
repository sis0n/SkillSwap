<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exchange_request_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->string('meeting_link')->nullable();
            $table->string('status')->default('scheduled');
            $table->timestamps();

            $table->index('exchange_request_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_sessions');
    }
};
