import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
    Tv, 
    Speaker, 
    Circle, 
    Cookie, 
    Beer, 
    Flame,
    ExternalLink,
    ArrowLeft,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Cache em memória por sessão (evita refetch ao rolar/navegar)
const sectionCache = {};

// Produtos fixos de afiliado Mercado Livre (sempre primeiro na seção correspondente)
const featuredTv = {
    id: 'featured-meli-tv',
    name: 'Smart Tv Dled 50 4k Multi Roku 4hdmi 2usb Wi-fi',
    best_price: 1799,
    image: 'https://customer-assets.emergentagent.com/job_c975d90b-2e22-401b-8406-8d712ff16fd5/artifacts/9e6evedc_file_000000000408720e8198adb78c247fb4.png',
    offer_url: 'https://meli.la/2qMnksA',
    stores: [{ store: 'Mercado Livre' }],
    _featured: true,
};

const featuredSpeaker = {
    id: 'featured-meli-speaker',
    name: 'Caixa Amplificada Connect Power Plus CM-550 Preto Mondial',
    best_price: 501.16,
    image: null,
    offer_url: 'https://meli.la/143kBWs',
    stores: [{ store: 'Mercado Livre' }],
    _featured: true,
    _placeholderIcon: 'speaker',
};

// Mapa de produtos fixos por seção
const featuredBySection = {
    'tvs': featuredTv,
    'caixas-som': featuredSpeaker,
};

const categories = [
    { 
        id: 'tvs', 
        name: 'TVs', 
        icon: Tv,
        description: 'Smart TVs para assistir os jogos em grande estilo',
        searchTerm: 'smart tv 4k 50'
    },
    { 
        id: 'caixas-som', 
        name: 'Caixas de Som', 
        icon: Speaker,
        description: 'Som potente para a torcida',
        searchTerm: 'caixa de som bluetooth potente'
    },
    { 
        id: 'bolas-futebol', 
        name: 'Bolas de Futebol', 
        icon: Circle,
        description: 'Tudo para jogar uma pelada',
        searchTerm: 'bola de futebol oficial'
    },
    { 
        id: 'petiscos', 
        name: 'Petiscos', 
        icon: Cookie,
        description: 'Snacks e aperitivos para o jogo',
        searchTerm: 'petiscos para festa'
    },
    { 
        id: 'bebidas', 
        name: 'Cerveja e Bebidas', 
        icon: Beer,
        description: 'Bebidas geladas para comemorar',
        searchTerm: 'cerveja lata pack'
    },
    { 
        id: 'churrasco', 
        name: 'Churrasco e Utensílios', 
        icon: Flame,
        description: 'Equipamentos para o churras da copa',
        searchTerm: 'kit churrasco grelha'
    },
];

const ProductCard = ({ product }) => (
    <a 
        href={product.offer_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
        data-testid={`product-card-${product.id}`}
    >
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all h-full ${product._featured ? 'border-2 border-green-500 dark:border-green-400 hover:border-green-600' : 'border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600'}`}>
            <div className="aspect-square bg-slate-50 dark:bg-slate-700 flex items-center justify-center p-3">
                {product.image ? (
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/200x200?text=Produto';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-lg">
                        {product._placeholderIcon === 'speaker' 
                            ? <Speaker className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                            : <Tv className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                        }
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col flex-1">
                <h3 className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2 mb-2 min-h-[40px]">
                    {product.name}
                </h3>
                {product.stores?.[0]?.store && (
                    <p className="text-xs text-muted-foreground mb-1">
                        {product._featured ? 'Oferta Mercado Livre (link de associado)' : product.stores[0].store}
                    </p>
                )}
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">
                    {product.best_price > 0
                        ? `R$ ${product.best_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'Ver preço'}
                </p>
                <Button 
                    variant={product._featured ? 'default' : 'outline'}
                    className={`w-full rounded-lg text-sm h-9 mt-auto ${product._featured ? 'bg-green-600 hover:bg-green-700 text-white' : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:text-green-400 group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-300 dark:group-hover:bg-green-900/20 dark:group-hover:text-green-400'}`}
                    data-testid={`ver-oferta-${product.id}`}
                >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver oferta
                </Button>
            </div>
        </div>
    </a>
);

const ProductCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-lg animate-pulse" />
        </div>
        <div className="p-3 flex flex-col flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-3 animate-pulse" />
            <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-1/2 mb-2 animate-pulse" />
            <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/3 mb-3 animate-pulse" />
            <div className="h-9 bg-slate-200 dark:bg-slate-600 rounded w-full mt-auto animate-pulse" />
        </div>
    </div>
);

const CategorySection = ({ category }) => {
    const featured = featuredBySection[category.id] || null;
    const apiLimit = featured ? 7 : 8;
    const [products, setProducts] = useState(sectionCache[category.id]?.products || []);
    const [loading, setLoading] = useState(!sectionCache[category.id]);
    const [error, setError] = useState(null);
    const fetchedRef = useRef(!!sectionCache[category.id]);
    const Icon = category.icon;

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `${API_URL}/api/products/search?q=${encodeURIComponent(category.searchTerm)}&page=1&page_size=${apiLimit}`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                const items = data.products || [];
                sectionCache[category.id] = { products: items };
                setProducts(items);
            } catch (err) {
                console.error(`Erro ao carregar ${category.name}:`, err);
                setError('Não foi possível carregar agora. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category.id, category.searchTerm, category.name, apiLimit]);

    const handleRetry = () => {
        fetchedRef.current = false;
        delete sectionCache[category.id];
        setProducts([]);
        setError(null);
        setLoading(true);

        const fetchProducts = async () => {
            try {
                const res = await fetch(
                    `${API_URL}/api/products/search?q=${encodeURIComponent(category.searchTerm)}&page=1&page_size=${apiLimit}`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const items = data.products || [];
                sectionCache[category.id] = { products: items };
                setProducts(items);
            } catch (err) {
                setError('Não foi possível carregar agora. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    };

    // Monta a lista final: card fixo primeiro (apenas TVs) + itens da API
    const displayProducts = isTvs ? [featuredTv, ...products] : products;

    return (
        <section className="mb-12" id={category.id} data-testid={`section-${category.id}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                        {category.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {isTvs && <ProductCard product={featuredTv} />}
                    {[...Array(apiLimit)].map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : error ? (
                isTvs ? (
                    <div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                            <ProductCard product={featuredTv} />
                        </div>
                        <div className="text-center py-6" data-testid={`error-${category.id}`}>
                            <p className="text-muted-foreground mb-3">{error}</p>
                            <Button variant="outline" size="sm" onClick={handleRetry} data-testid={`retry-${category.id}`}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Tentar novamente
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10" data-testid={`error-${category.id}`}>
                        <p className="text-muted-foreground mb-3">{error}</p>
                        <Button variant="outline" size="sm" onClick={handleRetry} data-testid={`retry-${category.id}`}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tentar novamente
                        </Button>
                    </div>
                )
            ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {displayProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground" data-testid={`empty-${category.id}`}>
                    Nenhum produto encontrado nesta categoria.
                </div>
            )}
        </section>
    );
};

export default function PromoCopaPage() {
    return (
        <>
            <Helmet>
                <title>Promoções para a Copa | EconomizeBem</title>
                <meta name="description" content="Seleção de produtos para curtir os jogos da copa gastando menos. TVs, caixas de som, petiscos, bebidas e muito mais." />
            </Helmet>

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                {/* Hero */}
                <section className="bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 py-12 md:py-16">
                    <div className="container-main">
                        <Link 
                            to="/"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                            data-testid="back-to-home"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para Home
                        </Link>
                        <div className="flex items-center gap-4 mb-4">
                            <img src="/assets/copa-trophy.png" alt="Taça da Copa" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-['Outfit']">
                                Promoções para se preparar para a Copa
                            </h1>
                        </div>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                            Seleção de itens para curtir os jogos gastando menos.
                        </p>
                    </div>
                </section>

                {/* Navegação rápida */}
                <section className="sticky top-0 z-40 bg-white dark:bg-slate-800 shadow-md py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="container-main">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map((cat) => {
                                const CatIcon = cat.icon;
                                return (
                                    <a
                                        key={cat.id}
                                        href={`#${cat.id}`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-slate-700 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400 transition-colors whitespace-nowrap text-sm font-medium"
                                        data-testid={`nav-${cat.id}`}
                                    >
                                        <CatIcon className="w-4 h-4" />
                                        {cat.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Conteúdo */}
                <main className="container-main py-10">
                    {categories.map((category) => (
                        <CategorySection key={category.id} category={category} />
                    ))}
                </main>

                <div className="container-main pb-8">
                    <p className="text-xs text-center text-muted-foreground">
                        Preços e disponibilidade podem variar. Dados via Google Shopping.
                    </p>
                </div>
            </div>
        </>
    );
}
