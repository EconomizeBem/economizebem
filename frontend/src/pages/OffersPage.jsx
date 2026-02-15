import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { 
    ExternalLink, Loader2, AlertCircle, ShoppingCart, Tag, 
    Percent, Clock, Filter, ChevronDown, Flame, Star
} from 'lucide-react';
import { Button } from '../components/ui/button';

const API_URL = 'https://economizebem-api.onrender.com';

// Labels de categorias
const CATEGORY_LABELS = {
    "smartphones": "Smartphones",
    "tv": "TVs",
    "linha_branca": "Linha Branca",
    "eletrodomesticos": "Eletrodomésticos",
    "acessorios": "Acessórios",
    "outros": "Outros"
};

// Componente de card de produto
const ProductCard = ({ item }) => {
    const [imageError, setImageError] = useState(false);
    
    const getInitials = (title) => {
        return title
            .split(' ')
            .slice(0, 2)
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const formatPrice = (price) => {
        if (!price) return null;
        return price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    return (
        <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            data-testid={`offer-card-${item.asin}`}
        >
            {/* Imagem */}
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
                {!imageError && item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-slate-400 dark:text-slate-500">
                            {getInitials(item.title)}
                        </span>
                    </div>
                )}
                
                {/* Badge de desconto */}
                {item.discount_pct && item.discount_pct > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        -{item.discount_pct}%
                    </div>
                )}
                
                {/* Badge de categoria */}
                <div className="absolute top-3 right-3 bg-slate-800/70 text-white px-2 py-1 rounded-full text-xs">
                    {CATEGORY_LABELS[item.category] || item.category}
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 mb-3 min-h-[3rem]">
                    {item.title}
                </h3>
                
                {/* Preços */}
                <div className="mb-3">
                    {item.list_price && item.price && item.list_price > item.price && (
                        <p className="text-slate-400 line-through text-sm">
                            {formatPrice(item.list_price)}
                        </p>
                    )}
                    {item.price ? (
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(item.price)}
                        </p>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Verificar preço na Amazon
                        </p>
                    )}
                </div>
                
                {/* Disponibilidade */}
                {item.availability && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {item.availability}
                    </p>
                )}
                
                <div className="mt-auto">
                    <a
                        href={item.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                        data-testid={`buy-button-${item.asin}`}
                    >
                        <Button 
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-11 font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Comprar na Amazon
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
};

// Componente de Ofertas do Dia
const DealsSection = ({ deals, updatedAt }) => {
    if (!deals || deals.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <Flame className="w-6 h-6 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        Ofertas do Dia
                    </h2>
                    <p className="text-sm text-slate-500">
                        Top 20 melhores descontos
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {deals.slice(0, 10).map((item) => (
                    <div 
                        key={item.asin}
                        className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg mb-2 overflow-hidden relative">
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-contain p-2"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-bold">
                                    {item.title?.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            {item.discount_pct && (
                                <span className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    -{item.discount_pct}%
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-1">
                            {item.title}
                        </p>
                        {item.price && (
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        )}
                        <a
                            href={item.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block text-center text-xs bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded-lg transition-colors"
                        >
                            Ver oferta
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('discount');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Buscar ofertas e deals em paralelo
                const [offersRes, dealsRes] = await Promise.all([
                    fetch(`${API_URL}/offers`),
                    fetch(`${API_URL}/deals`)
                ]);
                
                if (!offersRes.ok) {
                    throw new Error('Falha ao carregar ofertas');
                }
                
                const offersData = await offersRes.json();
                setOffers(offersData.items || []);
                setMetadata({
                    updated_at: offersData.updated_at,
                    updated_at_local: offersData.updated_at_local,
                    updated_at_full: offersData.updated_at_full,
                    disclaimer: offersData.disclaimer,
                    categories: offersData.categories || []
                });
                
                if (dealsRes.ok) {
                    const dealsData = await dealsRes.json();
                    setDeals(dealsData.items || []);
                }
            } catch (err) {
                console.error('Erro ao buscar ofertas:', err);
                setError('Ofertas temporariamente indisponíveis');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtrar e ordenar ofertas
    const filteredOffers = useMemo(() => {
        let result = [...offers];
        
        // Filtrar por categoria
        if (selectedCategory !== 'all') {
            result = result.filter(item => item.category === selectedCategory);
        }
        
        // Ordenar
        if (sortBy === 'discount') {
            result.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'priority') {
            result.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        }
        
        return result;
    }, [offers, selectedCategory, sortBy]);

    // Contar itens por categoria
    const categoryCounts = useMemo(() => {
        const counts = { all: offers.length };
        offers.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }, [offers]);

    return (
        <>
            <Helmet>
                <title>Ofertas Amazon | EconomizeBem</title>
                <meta name="description" content="Confira as melhores ofertas da Amazon selecionadas pelo EconomizeBem. Produtos com desconto e economia garantida." />
            </Helmet>

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900" data-testid="offers-page">
                {/* Header */}
                <section className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-12">
                    <div className="container-main">
                        <div className="text-center text-white">
                            <h1 className="text-3xl md:text-4xl font-bold font-['Outfit'] mb-3">
                                Ofertas Amazon
                            </h1>
                            <p className="text-orange-100 text-lg max-w-2xl mx-auto">
                                Produtos selecionados com os melhores preços. Clique e economize!
                            </p>
                            {metadata.updated_at_local && (
                                <div className="flex items-center justify-center gap-2 mt-4 text-orange-200 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Atualizado às {metadata.updated_at_local}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Conteúdo */}
                <section className="py-8">
                    <div className="container-main">
                        {/* Loading */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20" data-testid="loading-state">
                                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">Carregando ofertas...</p>
                            </div>
                        )}

                        {/* Erro */}
                        {error && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="error-state">
                                <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                    {error}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                    Por favor, tente novamente mais tarde. Estamos trabalhando para trazer as melhores ofertas para você.
                                </p>
                            </div>
                        )}

                        {/* Conteúdo carregado */}
                        {!loading && !error && (
                            <>
                                {/* Ofertas do Dia */}
                                <DealsSection deals={deals} updatedAt={metadata.updated_at_local} />

                                {/* Filtros */}
                                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtros:</span>
                                    </div>
                                    
                                    {/* Categoria */}
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="appearance-none bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                            data-testid="category-filter"
                                        >
                                            <option value="all">Todas ({categoryCounts.all || 0})</option>
                                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label} ({categoryCounts[key] || 0})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                    
                                    {/* Ordenação */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-slate-100 dark:bg-slate-700 border-0 rounded-lg px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                            data-testid="sort-filter"
                                        >
                                            <option value="discount">Maior desconto</option>
                                            <option value="price_asc">Menor preço</option>
                                            <option value="price_desc">Maior preço</option>
                                            <option value="priority">Mais relevantes</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                    </div>
                                    
                                    <span className="text-sm text-slate-500 ml-auto">
                                        {filteredOffers.length} produto{filteredOffers.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Grid de ofertas */}
                                {filteredOffers.length > 0 ? (
                                    <div 
                                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                        data-testid="offers-grid"
                                    >
                                        {filteredOffers.map((item) => (
                                            <ProductCard key={item.asin} item={item} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <ShoppingCart className="w-16 h-16 text-slate-400 mb-4" />
                                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                            Nenhuma oferta encontrada
                                        </h2>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            Tente selecionar outra categoria ou volte mais tarde.
                                        </p>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                {metadata.disclaimer && (
                                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
                                            <strong>Aviso:</strong> {metadata.disclaimer}
                                        </p>
                                        {metadata.updated_at_full && (
                                            <p className="text-xs text-amber-600 dark:text-amber-300 text-center mt-1">
                                                Última atualização: {metadata.updated_at_full}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
};

export default OffersPage;
