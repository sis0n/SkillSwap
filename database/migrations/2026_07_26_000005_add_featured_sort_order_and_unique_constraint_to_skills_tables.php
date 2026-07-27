<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('skill_categories', function (Blueprint $table) {
            $table->unsignedSmallInteger('sort_order')->default(0)->after('icon');
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->unsignedSmallInteger('sort_order')->default(0)->after('slug');
        });

        Schema::table('user_skills', function (Blueprint $table) {
            $table->boolean('featured')->default(false)->after('teaching_style');
            $table->unique(['user_id', 'skill_id', 'type'], 'user_skills_user_id_skill_id_type_unique');
        });
    }

    public function down(): void
    {
        Schema::table('user_skills', function (Blueprint $table) {
            $table->dropUnique('user_skills_user_id_skill_id_type_unique');
            $table->dropColumn('featured');
        });

        Schema::table('skills', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });

        Schema::table('skill_categories', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
