// src/app/components/Header.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
    // NextAuth のセッション状態（ログイン中かどうか）を取得
    const { data: session, status } = useSession();

    return (
        // 画面上部の共通ヘッダー
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                    MyApp
                </Link>
                <div>
                    {/* セッション読み込み中 */}
                    {status === 'loading' ? (
                        <p>Loading...</p>
                    /* ログイン済み: ユーザー名とログアウトボタンを表示 */
                    ) : session ? (
                        <div className="flex items-center space-x-4">
                            <p>ようこそ, {session.user?.name}さん</p>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                ログアウト
                            </button>
                        </div>
                    /* 未ログイン: ログインページへのリンクを表示 */
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                        >
                            ログイン
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    );
}
