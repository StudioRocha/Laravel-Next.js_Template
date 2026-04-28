<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * セッション（Cookie + web ガード）でログイン／ログアウトする処理をまとめたコントローラ。
 *
 * 【役割】
 * - メール・パスワードを受け取り、Laravel の `Auth::attempt` で認証する
 * - 成功時はセッションを再生成し、ログイン中ユーザー情報を JSON で返す（NextAuth の `authorize` などが利用）
 * - ログアウト時はガードを終了し、セッションを無効化する
 *
 * 【補足】
 * - このコントローラは web ルート（/login, /logout）で使う前提。
 * - API ルート配下ではセッションストアが無い構成が多く、そのままでは動作しない。
 */
class SessionAuthController extends Controller
{
    /**
     * メール＋パスワードでログインし、セッションを再生成してユーザー JSON を返す。
     * 注意: web ルートは CSRF 保護あり。SPA からは Sanctum の CSRF 取得フローが必要なことが多い。
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.',
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json(Auth::user());
    }

    /**
     * ログアウトしてセッションを破棄する。
     */
    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
