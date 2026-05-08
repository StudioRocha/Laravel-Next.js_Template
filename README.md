# Laravel + Next.js Template

Laravel API と Next.js フロントエンドを組み合わせたテンプレートです。  
ローカル開発は Laravel Sail（Docker）を前提にしています。

## 前提環境

- PHP: `8.4.x`
- Composer: `2.8+` 推奨
- Node.js: `20+`（LTS推奨）
- npm: `10+`
- Docker / Docker Compose（Sail を使う場合）

## リポジトリ構成（例）

- `laravel-next-Recofy2/`: Laravel API
- `next-frontend-Recofy2/`: Next.js フロントエンド

フォルダ名は必要に応じて変更可能です。変更した場合は、下記の `cd` 先や `.env` のパスを読み替えてください。

## 画面・ページ構成（テンプレート現状）

**現状ある画面・API だけ**を整理しています。

### Next.js（`next-frontend-Recofy2`）

| URL | 説明 |
|-----|------|
| `/` | トップ。シンプルなウェルカム文言（`Hello, Frontend!`）。 |
| `/login` | メール／パスワードのログインフォーム。NextAuth の Credentials で Laravel に連携。 |
| `/products` | Laravel API から商品一覧を取得して表示。 |

共通 UI:

- **全ページ**でルートレイアウトに `Header`（アプリ名「MyApp」、未ログイン時はログインリンク、ログイン後はユーザー名とログアウト）。
- NextAuth 用の **App Router API**: `GET/POST /api/auth/*`（`src/app/api/auth/[...nextauth]/route.ts`）。

※ `/blog` などは **ルート未作成のため 404** になります。

### Laravel（`laravel-next-Recofy2`）

**Web**（ブラウザ／フォーム・Cookie 前提。オリジンは API のホスト側）:

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/` | デフォルトの `welcome` ビュー。 |
| `POST` | `/login` | セッションログイン（Next からの連携想定）。 |
| `POST` | `/logout` | セッションのログアウト。 |

**API**（通常 `APP_URL` 直下で `/api` プレフィックス。例: `http://localhost/api/...`）:

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/products` | 商品一覧（公開）。 |
| `GET` | `/api/user` | 認証済みユーザー情報（`auth:sanctum`）。 |
| `GET` | `/sanctum/csrf-cookie` | Sanctum 用 CSRF Cookie 取得（オリジンは Laravel 側）。NextAuth の `authorize` 内で利用。 |

## 認証まわり（NextAuth.js と Laravel Sanctum）

このテンプレートでは **フロントとバックエンドで役割を分けた認証** を採用しています。

### NextAuth.js（`next-auth` · Next.js 側）

- **何をするか**: Next.js アプリ向けの認証基盤。サインイン／サインアウト、セッション（このテンプレートでは **JWT 戦略**）などを扱います。
- **このテンプレでの使い方**: `CredentialsProvider` の `authorize` 内で、Laravel の `/sanctum/csrf-cookie` → `POST /login` → `GET /api/user` を順に呼び、**Laravel のセッション Cookie と連携**したうえでユーザー情報を NextAuth のセッションに載せます。
- **主な設定**: `.env.local` の `NEXTAUTH_URL`・`NEXTAUTH_SECRET`、`NEXT_PUBLIC_API_BASE_URL`。ルートは `src/app/api/auth/[...nextauth]/route.ts`。
- **注意**: NextAuth の JWT と Laravel のセッションは **別物**ですが、ログイン処理では Laravel 側が正として動きます。

### Laravel Sanctum（`laravel/sanctum` · Laravel 側）

- **何をするか**: 公式の軽量認証。SPA 向けの **Cookie セッション（ファーストパーティ）** と、必要なら **API トークン** も扱えます。
- **このテンプレでの使い方**:
  - `bootstrap/app.php` で API グループ先頭に `EnsureFrontendRequestsAreStateful` を入れ、**同一オリジン扱いの SPA からのリクエストをセッション認証可能**にしています。
  - `/api/user` は `auth:sanctum` で保護。設定は `config/sanctum.php`、環境変数は `.env` / `.env.example`（CORS・`SANCTUM_STATEFUL_DOMAINS` など）。
- **CSRF**: SPA から `web` 系ルートに触れる前に `/sanctum/csrf-cookie` で Cookie を取る流れがテンプレの前提です。

### まとめ

| 層 | パッケージ | 役割のイメージ |
|----|------------|----------------|
| Next.js | **NextAuth.js** | フロントのログイン UI・Next 側のセッション表現（JWT） |
| Laravel | **Sanctum** | API／セッションの認証、SPA 用 Cookie・CSRF・`auth:sanctum` |

## 初回セットアップ（Laravel 側）

作業ディレクトリ: `laravel-next-Recofy2`

```bash
cd laravel-next-Recofy2
```

### 1. 環境ファイル作成

```bash
cp .env.example .env
```

### 2. 依存パッケージインストール

```bash
composer install
```

### 3. アプリキー発行

```bash
php artisan key:generate
```

### 4. Sail 起動（Docker 利用時）

```bash
./vendor/bin/sail up -d
```

### 5. マイグレーション実行

```bash
./vendor/bin/sail artisan migrate
```

### 6. シーダー実行（テンプレート：登録済みをすべて投入）

環境構築時は、マイグレーション後に **登録されているシーダーをまとめて実行** してください。  
`DatabaseSeeder` の `$this->call([...])` に列挙されたクラスが順に実行されます（現状は `TestUserSeeder` と `ProductSeeder`）。

```bash
./vendor/bin/sail artisan db:seed
```

新しいシーダーを追加したら、`database/seeders/DatabaseSeeder.php` にクラス名を追記すると、上記コマンドで同じく一括実行の対象になります。

## フロントエンド（Next.js 側）セットアップ

作業ディレクトリ: `next-frontend-Recofy2`

```bash
cd next-frontend-Recofy2
```

### 1. 環境ファイル作成

プロジェクトルートに `next-frontend-Recofy2/.env.local` を作成し、以下を保存:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ランダムな長い文字列
```

### 2. 依存インストールと起動

```bash
npm install
npm run dev
```

### 3. NextAuth セットアップ

依存に `next-auth` が含まれていれば追加インストールは不要です。必要なら:

```bash
npm install next-auth
```

`NEXTAUTH_SECRET` はプレースホルダのまま使わず、ランダム文字列に置き換えます。

```bash
openssl rand -base64 32
```

出力値を `.env.local` の `NEXTAUTH_SECRET=` に貼り付けてください。

次に、NextAuth の API ルートを作成します。

- `src/app/api/auth/[...nextauth]/route.ts`

このテンプレートでは `CredentialsProvider` を使って Laravel 側の `/login` と `/api/user` を呼び、認証情報を `jwt` / `session` コールバックに引き渡す構成を想定します。

認証状態をクライアント全体で参照する場合は、`SessionProvider` をルートレイアウト配下で有効化します。

- `src/app/providers.tsx` で `SessionProvider` をラップ
- `src/app/layout.tsx` で `Providers` を読み込み、`children` をラップ

## 開発コマンド（Laravel 側）

`laravel-next-Recofy2` で実行:

```bash
# ローカル（php artisan serve + Vite 等）
composer run dev

# テスト
composer run test
```

Sail 経由の例:

```bash
./vendor/bin/sail artisan test
./vendor/bin/sail artisan db:seed
./vendor/bin/sail npm run dev
```

## よくあるエラーと対処

### `composer install` が失敗する（`php >=8.4`）

現在の `composer.lock` は PHP 8.4 前提です。  
`php -v` で 8.4 を使っているか確認してください。

### `ext-dom` / `ext-xml` が不足している

PHP の XML 拡張が必要です。  
使用中の PHP バージョンに対応した `xml` 拡張を有効化してください。

### Composer の警告（Deprecation Notice）が多い

古い Composer を使っていると、PHP 8.4 で警告が増えることがあります。  
実行自体は通る場合がありますが、必要なら Composer 本体を更新してください。

## API / Front URL（ローカル想定）

- Laravel API: `http://localhost`
- Next.js: `http://localhost:3000`

## 補足

- Laravel 側の `.env.example` には Sanctum / CORS のローカル開発用設定が含まれています。
- セッションや認証方式を変更する場合は、Laravel 側と Next 側の両方で設定を揃えてください。
