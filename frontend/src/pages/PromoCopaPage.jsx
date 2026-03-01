import { useState, useEffect } from 'react';
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
    Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Categorias da promoção Copa
const categories = [
    { 
        id: 'tvs', 
        name: 'TVs', 
        icon: Tv,
        description: 'Smart TVs para assistir os jogos em grande estilo',
        searchTerm: 'smart tv'
    },
    { 
        id: 'caixas-som', 
        name: 'Caixas de Som', 
        icon: Speaker,
        description: 'Som potente para a torcida',
        searchTerm: 'caixa de som bluetooth'
    },
    { 
        id: 'bolas-acessorios', 
        name: 'Bolas e Acessórios', 
        icon: Circle,
        description: 'Tudo para jogar uma pelada',
        searchTerm: 'bola futebol'
    },
    { 
        id: 'petiscos', 
        name: 'Petiscos', 
        icon: Cookie,
        description: 'Snacks e aperitivos para o jogo',
        searchTerm: 'amendoim petisco'
    },
    { 
        id: 'bebidas', 
        name: 'Cerveja e Bebidas', 
        icon: Beer,
        description: 'Bebidas geladas para comemorar',
        searchTerm: 'cerveja lata'
    },
    { 
        id: 'churrasco', 
        name: 'Churrasco e Utensílios', 
        icon: Flame,
        description: 'Equipamentos para o churras da copa',
        searchTerm: 'churrasqueira'
    },
];

// Componente de Card de Produto
const ProductCard = ({ product }) => (
    <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-lg transition-shadow"
    >
        {/* Imagem */}
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 flex items-center justify-center p-2">
            <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200?text=Produto';
                }}
            />
        </div>
        
        {/* Conteúdo */}
        <div className="p-3 flex flex-col flex-1">
            {/* Nome */}
            <h3 className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2 mb-2 min-h-[40px]">
                {product.name}
            </h3>
            
            {/* Preço */}
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                {product.price > 0 ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Ver preço'}
            </p>
            
            {/* Loja */}
            <p className="text-xs text-muted-foreground mb-3">
                {product.store || 'Loja parceira'}
            </p>
            
            {/* Botão */}
            <a 
                href={product.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-auto"
            >
                <Button 
                    variant="outline" 
                    className="w-full rounded-lg text-sm h-9 hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver oferta
                </Button>
            </a>
        </div>
    </div>
);

// Componente de Card Loading
const ProductCardLoading = () => (
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

// Seção de Categoria
const CategorySection = ({ category }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const Icon = category.icon;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${API_URL}/api/products/search?q=${encodeURIComponent(category.searchTerm)}&page=1&page_size=6`
                );
                const data = await response.json();
                
                if (data.products && data.products.length > 0) {
                    setProducts(data.products);
                } else {
                    setProducts([]);
                }
            } catch (err) {
                console.error(`Error fetching ${category.name}:`, err);
                setError('Erro ao carregar produtos');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category.searchTerm, category.name]);

    return (
        <section 
            className="mb-12"
            id={category.id}
            data-testid={`section-${category.id}`}
        >
            {/* Header da Seção */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                        {category.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {category.description}
                    </p>
                </div>
            </div>
            
            {/* Grid de Produtos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {loading ? (
                    // Loading state
                    [...Array(6)].map((_, i) => (
                        <ProductCardLoading key={i} />
                    ))
                ) : error ? (
                    // Error state
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        {error}
                    </div>
                ) : products.length > 0 ? (
                    // Products
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    // Empty state
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado nesta categoria.
                    </div>
                )}
            </div>
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
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para Home
                        </Link>
                        
                        <div className="flex items-center gap-4 mb-4">
                            <img src="/assets/copa-trophy.png" alt="Taça da Copa" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white font-['Outfit']">
                                    Promoções para se preparar para a Copa
                                </h1>
                            </div>
                        </div>
                        
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                            Seleção de itens para curtir os jogos gastando menos.
                        </p>
                    </div>
                </section>
                
                {/* Navegação rápida por categorias */}
                <section className="sticky top-0 z-40 bg-white dark:bg-slate-800 shadow-md py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="container-main">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <a
                                        key={cat.id}
                                        href={`#${cat.id}`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-slate-700 dark:text-slate-300 hover:text-green-700 dark:hover:text-green-400 transition-colors whitespace-nowrap text-sm font-medium"
                                    >
                                        <Icon className="w-4 h-4" />
                                        {cat.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </section>
                
                {/* Conteúdo Principal */}
                <main className="container-main py-10">
                    {categories.map((category) => (
                        <CategorySection key={category.id} category={category} />
                    ))}
                </main>
                
                {/* Aviso de Afiliado */}
                <div className="container-main pb-8">
                    <p className="text-xs text-center text-muted-foreground">
                        Alguns links podem ser de afiliados. Isso não altera o preço para você e ajuda a manter o EconomizeBem.
                    </p>
                </div>
            </div>
        </>
    );
}
