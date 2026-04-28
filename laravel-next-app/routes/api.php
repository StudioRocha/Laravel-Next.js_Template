<?php

use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 商品一覧API
Route::get('/products', [ProductController::class, 'index']);

// 認証済みユーザーのみアクセス可能なルート（Bearer トークン or Sanctum SPA など）
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
