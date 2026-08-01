<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exchange_requests', function (Blueprint $table) {
            $table->string('reconfirmation_required_by')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('exchange_requests', function (Blueprint $table) {
            $table->dropColumn('reconfirmation_required_by');
        });
    }
};
