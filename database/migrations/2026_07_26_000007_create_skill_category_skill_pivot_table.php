<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_category_skill', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_category_id')->constrained('skill_categories')->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained('skills')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['skill_category_id', 'skill_id'], 'skill_category_skill_unique');
        });

        $now = now();
        DB::statement('INSERT INTO skill_category_skill (skill_category_id, skill_id, created_at, updated_at) SELECT category_id, id, ?, ? FROM skills WHERE category_id IS NOT NULL', [$now, $now]);

        Schema::table('skills', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['category_id']);
            $table->dropColumn('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('skills', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('skill_categories')->cascadeOnDelete();
            $table->index('category_id');
        });

        DB::statement('UPDATE skills SET category_id = (SELECT skill_category_id FROM skill_category_skill WHERE skill_id = skills.id LIMIT 1)');

        Schema::dropIfExists('skill_category_skill');
    }
};
