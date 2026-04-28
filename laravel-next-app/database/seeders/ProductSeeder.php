<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product; // Productモデルをインポート

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'name' => '商品A',
            'description' => 'これは商品Aです。高品質な素材を使用しています。',
            'price' => 1000,
        ]);

        Product::create([
            'name' => '商品B',
            'description' => 'これは商品Bです。最新の技術で作られています。',
            'price' => 2500,
        ]);

        // Fakerを使ってランダムなデータを8件追加
        Product::factory()->count(8)->create();
    }
}