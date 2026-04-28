import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

function toCookieHeader(setCookieHeaders: string[]): string {
    return setCookieHeaders
        .map((cookie) => cookie.split(';', 1)[0])
        .filter(Boolean)
        .join('; ');
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            // 第2引数は教材では req。未使用のため _req（リンター対策のみで挙動は同じ）
            async authorize(credentials, _req) {
                const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
                if (!apiBase) {
                    return null;
                }

                // API ベース（例: http://localhost/api）から Laravel の origin（例: http://localhost）を取り出す
                const laravelOrigin = new URL(apiBase).origin;
                // Sanctum が stateful 判定に使うフロント側オリジン（未設定時は localhost:3000）
                const frontendOrigin = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

                // web ルートでログインするために、先に Sanctum の CSRF Cookie を取得
                const csrfRes = await fetch(`${laravelOrigin}/sanctum/csrf-cookie`, {
                    method: 'GET',
                });
                const csrfSetCookies =
                    csrfRes.headers.getSetCookie?.() ??
                    (csrfRes.headers.get('set-cookie') ? [csrfRes.headers.get('set-cookie')!] : []);
                const csrfCookie = toCookieHeader(csrfSetCookies);
                const xsrfToken = decodeURIComponent(
                    csrfCookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
                );

                // Laravel web ルート（/login）へのログインリクエスト
                const res = await fetch(`${laravelOrigin}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
                        ...(csrfCookie ? { Cookie: csrfCookie } : {}),
                    },
                    body: JSON.stringify({
                        email: credentials?.email,
                        password: credentials?.password,
                    }),
                });

                if (!res.ok) {
                    return null;
                }

                // ユーザー情報を取得（/api/user は既存どおり API ベース経由）
                const userRes = await fetch(`${apiBase}/user`, {
                    headers: {
                        // ログインリクエストのレスポンスからCookieヘッダーを取得して設定
                        Cookie: toCookieHeader(
                            res.headers.getSetCookie?.() ??
                                (res.headers.get('set-cookie')
                                    ? [res.headers.get('set-cookie')!]
                                    : [])
                        ),
                        Accept: 'application/json',
                        Origin: frontendOrigin,
                        Referer: `${frontendOrigin}/login`,
                    },
                });

                if (!userRes.ok) {
                    return null;
                }

                const user = await userRes.json();

                // ユーザーオブジェクトを返す
                return user;
            },
        }),
    ],
    // --- NextAuth 側の「セッション管理」と「コールバック」（Laravel のセッションとは別物）---
    // ブラウザがログイン状態かどうかを、主に JWT（暗号化されたトークン）で表すのがこの設定ブロック。
    // Laravel は authorize() の中でだけ関わる。ここ以降は「Next がユーザー情報をどう覚えるか」の話。

    // Credentials では DB セッションではなく JWT を使う指定が必要（省略するとログイン後も user が空になりやすい）
    session: { strategy: 'jwt' },

    // コールバック: サインインの各段階で NextAuth が呼び出すフック（トークン組み立て・session 公開用）
    // authorize() が返した user を、以降のリクエストでも参照できるよう token / session に載せる
    callbacks: {
        // jwt: 毎回のリクエストで使う「JWT の中身」を作る。初回サインイン時だけ user が入るので token に退避する
        async jwt({ token, user }) {
            if (user) {
                // next-auth.d.ts を使わず型エラーを避けるためのキャスト（中身は Laravel の user JSON）
                (token as unknown as { user: Record<string, unknown> }).user =
                    user as unknown as Record<string, unknown>;
            }
            return token;
        },
        // session: クライアントやサーバーが getSession() / useSession で読む session オブジェクトを作る
        async session({ session, token }) {
            const u = (token as unknown as { user?: Record<string, unknown> }).user;
            if (u && session.user) {
                Object.assign(session.user, u);
            }
            return session;
        },
    },

    pages: {
        signIn: '/login', // カスタムログインページのパス
    },

    // secret: 上記 JWT を署名・検証するための鍵（NextAuth のセッション管理の根っこ）。.env.local の NEXTAUTH_SECRET
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
