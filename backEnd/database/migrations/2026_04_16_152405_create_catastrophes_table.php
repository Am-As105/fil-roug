<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('catastrophes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->date('date');
            $table->string('severity');
            $table->string('status');
            $table->foreignId('type_id')->constrained()->cascadeOnDelete();
            $table->integer('victims')->nullable();
            $table->integer('injured')->nullable();
            $table->decimal('damage', 10, 2)->nullable();
            $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catastrophes');
    }
};
