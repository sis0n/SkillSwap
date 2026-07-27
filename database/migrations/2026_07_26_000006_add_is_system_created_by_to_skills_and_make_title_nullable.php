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
        Schema::table('skills', function (Blueprint $table) {
            $table->boolean('is_system')->default(false)->after('sort_order');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('is_system');
        });

        if (DB::getDriverName() === 'sqlite') {
            Schema::table('user_skills', function (Blueprint $table) {
                $table->string('title', 100)->nullable()->change();
            });
        } else {
            DB::statement('ALTER TABLE user_skills ALTER COLUMN title DROP NOT NULL');
            DB::statement('ALTER TABLE user_skills ALTER COLUMN title TYPE VARCHAR(100)');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('user_skills', function (Blueprint $table) {
                $table->string('title', 255)->nullable(false)->change();
            });
        } else {
            DB::statement('ALTER TABLE user_skills ALTER COLUMN title SET NOT NULL');
            DB::statement('ALTER TABLE user_skills ALTER COLUMN title TYPE VARCHAR(255)');
        }

        Schema::table('skills', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn('is_system');
        });
    }
};
