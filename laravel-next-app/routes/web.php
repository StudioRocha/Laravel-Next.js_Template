<?php

use App\Http\Controllers\Auth\SessionAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// セッション＋Cookie 前提のログイン／ログアウト（URL は /login, /logout）
// Next の NEXT_PUBLIC_API_BASE_URL が http://localhost/api のときは routes/api.php 側が呼ばれる
Route::post('/login', [SessionAuthController::class, 'login']);
Route::post('/logout', [SessionAuthController::class, 'logout']);
