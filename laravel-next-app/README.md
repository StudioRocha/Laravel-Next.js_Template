必須バージョン
PHP 8.4.x
Composer 2.8+ 推奨
Node 20+（または実際に使ってるLTS）
Docker/Sail利用有無
初期セットアップ手順
cp .env.example .env
composer install
php artisan key:generate
npm install
./vendor/bin/sail up -d（使うなら）
よくあるエラー
php version does not satisfy → PHP 8.4を使う
ext-dom / ext-xml missing → XML拡張を有効化
API/FrontendのURL
Laravel: http://localhost
Next: http://localhost:3000（使ってる構成なら）
