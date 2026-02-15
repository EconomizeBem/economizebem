import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ExternalLink, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';

// Componente de card de produto
const ProductCard = ({ item }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    const getInitials = (asin) => {
        return asin.slice(0, 2).toUpperCase();
    };

    return (
        <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            data-testid={`offer-card-${item.asin}`}
        >
            {/* Imagem */}
            <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                {!imageError && item.image_url && (
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                )}
                {(!imageLoaded || imageError) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <ShoppingCart className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">Ver produto</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 mb-3 min-h-[3rem]">
                    {item.title}
                </h3>
                
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
                            Ver na Amazon
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
};

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch do arquivo estático local
                const response = await fetch('/offers.json');
                
                if (!response.ok) {
                    throw new Error('Falha ao carregar ofertas');
                }
                
                const data = await response.json();
                setOffers(data.items || []);
            } catch (err) {
                console.error('Erro ao buscar ofertas:', err);
                setError('Ofertas temporariamente indisponíveis.');
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

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
                                    Por favor, tente novamente mais tarde.
                                </p>
                            </div>
                        )}

                        {/* Grid de ofertas */}
                        {!loading && !error && offers.length > 0 && (
                            <div 
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                                data-testid="offers-grid"
                            >
                                {offers.map((item) => (
                                    <ProductCard key={item.asin} item={item} />
                                ))}
                            </div>
                        )}

                        {/* Sem ofertas */}
                        {!loading && !error && offers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="empty-state">
                                <ShoppingCart className="w-16 h-16 text-slate-400 mb-4" />
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                    Nenhuma oferta disponível no momento
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Volte em breve para conferir novas ofertas!
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
};

export default OffersPage;
