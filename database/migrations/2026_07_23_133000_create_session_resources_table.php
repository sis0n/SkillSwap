<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_session_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('url');
            $table->string('type')->default('link');
            $table->timestamps();

            $table->index('learning_session_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_resources');
    }
};
