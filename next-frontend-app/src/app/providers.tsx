'use client';

// このファイルはサーバー（layout.tsx）から import されるが、'use client' によりクライアント境界になる
import { SessionProvider } from 'next-auth/react';

/** NextAuth のセッション文脈を子コンポーネントへ渡すラッパー */
export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
