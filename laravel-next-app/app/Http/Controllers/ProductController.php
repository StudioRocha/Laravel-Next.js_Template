<?php

namespace App\Http\Controllers;

use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        // Productモデルを使って、productsテーブルのすべてのレコードを取得
        $products = Product::all();

        // 取得したデータをJSON形式で返す
        return response()->json($products);
    }
}
