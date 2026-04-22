<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'phone' => '0600000000',
                'adress' => 'Casablanca',
                'role' => 'admin',
                'password' => Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'citizen@example.com'],
            [
                'name' => 'Citizen User',
                'phone' => '0611111111',
                'adress' => 'Rabat',
                'role' => 'citizen',
                'password' => Hash::make('password'),
            ]
        );
    }
}
