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

- `laravel-next-Recofy2`: Laravel API（このディレクトリ）
- `next-frontend-app`: Next.js フロントエンド（別ディレクトリ運用の場合）

必要に応じてフォルダ名は変更可能です。  
ただし、README の `cd` コマンドやローカルの絶対パス設定は読み替えてください。

## 初回セットアップ（Laravel 側）

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

## フロントエンド（Next.js 側）セットアップ

Next.js プロジェクトのディレクトリで実行:

```bash
npm install
npm run dev
```

## 開発コマンド（Laravel 側）

```bash
# ローカル（php artisan serve + Vite 等）
composer run dev

# テスト
composer run test
```

Sail 経由の例:

```bash
./vendor/bin/sail artisan test
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

- `.env.example` には Sanctum / CORS のローカル開発用設定が含まれています。
- セッションや認証方式を変更する場合は、Laravel 側と Next 側の両方で設定を揃えてください。
