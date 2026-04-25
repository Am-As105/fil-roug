<?php

namespace Database\Seeders;

use App\Models\Type;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Type::insert([
    ['name' => 'Incendie'],
    ['name' => 'Inondation'],
    ['name' => 'Tremblement de terre'],
    ['name' => 'Accident'],
    ['name' => 'Attaque'],
    ['name' => 'Tempête'],
    ['name' => 'Glissement de terrain'],
    ['name' => 'Éruption volcanique']
]);
    }
}
