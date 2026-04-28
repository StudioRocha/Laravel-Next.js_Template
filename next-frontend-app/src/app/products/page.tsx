// 商品一覧ページ（URL は /products）

// Laravel API が返す1件分の形
interface Product {
    id: number; // 商品ID
    name: string; // 商品名
    description: string; // 説明文
    price: number; // 価格（数値）
    created_at: string; // 作成日時（ISO文字列）
    updated_at: string; // 更新日時（ISO文字列）
}

// サーバー側で API を叩いて配列を返す
async function getProducts(): Promise<Product[]> {
    // .env.local の NEXT_PUBLIC_API_BASE_URL + /products（例: http://localhost/api/products）
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`;
    // GET（開発中はキャッシュしない）
    const res = await fetch(url, { cache: 'no-store' });
    // ステータスが 200 台以外なら例外
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    // レスポンス本文を JSON としてパース
    return res.json();
}

// 1件分をカード風に表示する部品
function ProductCard({ product }: { product: Product }) {
    return (
        // 枠・余白・影
        <div className="border rounded-lg p-6 shadow-md bg-white">
            {/* 商品名 */}
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            {/* 説明 */}
            <p className="text-gray-600 mb-4">{product.description}</p>
            {/* 価格（3桁区切り） */}
            <p className="text-xl font-bold text-right text-gray-800">
                &yen;{product.price.toLocaleString()}
            </p>
        </div>
    );
}

// このファイルのページ本体（サーバーコンポーネント = サーバーで fetch する）
export default async function ProductsPage() {
    // 一覧データを取得
    const products = await getProducts();

    return (
        // ページ全体のレイアウト
        <main className="container mx-auto p-8 bg-gray-50 min-h-screen">
            {/* ページタイトル */}
            <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">商品一覧</h1>
            {/* カードを並べるグリッド（画面幅で列数が変わる） */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 件数分ループしてカードを並べる */}
                {products.map((product) => (
                    // key は React のリスト必須ルール
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </main>
    );
}
