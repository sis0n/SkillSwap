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
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('exchange_requests', function (Blueprint $table) {
                $table->foreignId('learning_skill_id')->nullable()->change();
            });
        } else {
            DB::statement('ALTER TABLE exchange_requests ALTER COLUMN learning_skill_id DROP NOT NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('exchange_requests', function (Blueprint $table) {
                $table->foreignId('learning_skill_id')->nullable(false)->change();
            });
        } else {
            DB::statement('ALTER TABLE exchange_requests ALTER COLUMN learning_skill_id SET NOT NULL');
        }
    }
};
