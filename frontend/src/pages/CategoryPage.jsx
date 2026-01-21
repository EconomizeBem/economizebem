import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Search, Grid, List, SlidersHorizontal, Tag, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../components/ui/sheet';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { productsApi } from '../lib/api';

const sortOptions = [
    { value: 'price_asc', label: 'Menor preço' },
    { value: 'price_desc', label: 'Maior preço' },
    { value: 'rating', label: 'Melhor avaliação' },
    { value: 'discount', label: 'Maior desconto' },
];

/**
 * Componente reutilizável para páginas de categoria
 * @param {Object} props
 * @param {string} props.title - Título da página (ex: "Geladeiras")
 * @param {string} props.subtitle - Subtítulo descritivo
 * @param {string} props.defaultSearch - Termo de busca padrão ao carregar
 * @param {Array} props.subcategories - Lista de subcategorias/filtros rápidos
 * @param {React.Component} props.icon - Ícone da categoria
 * @param {string} props.accentColor - Cor de destaque (sky, emerald, amber, etc.)
 * @param {string} props.metaDescription - Descrição para SEO
 * @param {string} props.categorySlug - Slug da categoria para breadcrumb
 */
export default function CategoryPage({ 
    title, 
    subtitle, 
    defaultSearch, 
    subcategories = [], 
    icon: Icon,
    accentColor = 'sky',
    metaDescription,
    categorySlug
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [activeSubcategory, setActiveSubcategory] = useState(searchParams.get('sub') || 'all');
    const [sortBy, setSortBy] = useState('price_asc');
    const [viewMode, setViewMode] = useState('grid');
    const [hasSearched, setHasSearched] = useState(false);

    // SEO meta description
    const seoDescription = metaDescription || `Compare preços de ${title} nas melhores lojas do Brasil. Encontre ofertas, descontos e economize em ${title.toLowerCase()} com o EconomizeBem.`;

    // Cores dinâmicas baseadas no accentColor
    const colorClasses = useMemo(() => ({
        bg: `bg-${accentColor}-500 dark:bg-${accentColor === 'sky' ? 'cyan' : accentColor}-600`,
        bgLight: `bg-${accentColor}-100 dark:bg-${accentColor === 'sky' ? 'cyan' : accentColor}-900/40`,
        text: `text-${accentColor}-600 dark:text-${accentColor === 'sky' ? 'cyan' : accentColor}-400`,
        hover: `hover:bg-${accentColor}-600 dark:hover:bg-${accentColor === 'sky' ? 'cyan' : accentColor}-500`,
        border: `border-${accentColor}-500 dark:border-${accentColor === 'sky' ? 'cyan' : accentColor}-600`,
    }), [accentColor]);

    // Buscar produtos quando a página carrega ou quando os parâmetros mudam
    useEffect(() => {
        const searchFromUrl = searchParams.get('q') || '';
        const subFromUrl = searchParams.get('sub') || 'all';
        
        setSearchTerm(searchFromUrl);
        setActiveSubcategory(subFromUrl);
        
        // Determinar o termo de busca
        let queryTerm = searchFromUrl;
        
        // Se não há busca manual, usar subcategoria ou busca padrão
        if (!queryTerm) {
            if (subFromUrl && subFromUrl !== 'all') {
                const sub = subcategories.find(s => s.id === subFromUrl);
                queryTerm = sub?.searchTerm || subFromUrl;
            } else {
                queryTerm = defaultSearch;
            }
        }
        
        fetchProducts(queryTerm);
    }, [searchParams, defaultSearch]);

    const fetchProducts = async (search) => {
        setLoading(true);
        setError(null);
        
        const query = search?.trim() || defaultSearch;
        
        try {
            const response = await productsApi.getAll(query);
            setProducts(response.data || []);
            setHasSearched(true);
            
            if (response.data?.length === 0 && query) {
                toast.info(`Nenhum produto encontrado para "${query}"`);
            }
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            setError('Erro ao buscar produtos. Tente novamente.');
            toast.error('Erro ao buscar produtos. Tente novamente.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        
        setSearchParams(prev => {
            if (query) prev.set('q', query);
            else prev.delete('q');
            prev.delete('sub');
            return prev;
        });
        
        setActiveSubcategory('all');
    };

    const handleSubcategoryChange = (subId) => {
        setActiveSubcategory(subId);
        setSearchTerm('');
        
        setSearchParams(prev => {
            prev.delete('q');
            if (subId !== 'all') prev.set('sub', subId);
            else prev.delete('sub');
            return prev;
        });
    };

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc': return a.best_price - b.best_price;
            case 'price_desc': return b.best_price - a.best_price;
            case 'rating': 
                const ratingA = Math.max(...(a.stores?.map(s => s.rating) || [0]));
                const ratingB = Math.max(...(b.stores?.map(s => s.rating) || [0]));
                return ratingB - ratingA;
            case 'discount':
                const discountA = a.stores?.[0]?.original_price ? 
                    (a.stores[0].original_price - a.best_price) / a.stores[0].original_price : 0;
                const discountB = b.stores?.[0]?.original_price ? 
                    (b.stores[0].original_price - b.best_price) / b.stores[0].original_price : 0;
                return discountB - discountA;
            default: return 0;
        }
    });

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{`${title} - Compare Preços | EconomizeBem`}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={`${title.toLowerCase()}, comparar preços, ofertas, descontos, ${defaultSearch}`} />
                <link rel="canonical" href={`https://economizebem.com.br/categoria/${categorySlug || title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'e')}`} />
                <meta property="og:title" content={`${title} - Compare Preços | EconomizeBem`} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="website" />
            </Helmet>

            <div className="min-h-screen py-8" data-testid={`category-page-${title.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="container-main">
                    {/* Header com ícone e breadcrumb */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <a href="/" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Início</a>
                            <ChevronRight className="w-4 h-4" />
                            <a href="/products" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Produtos</a>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-foreground font-medium">{title}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {Icon && (
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-sky-100 dark:bg-cyan-900/40`}>
                                    <Icon className={`w-7 h-7 text-sky-600 dark:text-cyan-400`} />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold font-['Manrope']">
                                    Compare preços de {title}
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    {subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subcategorias/Filtros Rápidos */}
                {subcategories.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Filtros rápidos:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                variant={activeSubcategory === 'all' ? 'default' : 'outline'}
                                className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                                    activeSubcategory === 'all' 
                                        ? 'bg-sky-500 dark:bg-cyan-600 hover:bg-sky-600 dark:hover:bg-cyan-500' 
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-600'
                                }`}
                                onClick={() => handleSubcategoryChange('all')}
                                data-testid="subcategory-all"
                            >
                                Todos
                            </Badge>
                            {subcategories.map(sub => (
                                <Badge
                                    key={sub.id}
                                    variant={activeSubcategory === sub.id ? 'default' : 'outline'}
                                    className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                                        activeSubcategory === sub.id 
                                            ? 'bg-sky-500 dark:bg-cyan-600 hover:bg-sky-600 dark:hover:bg-cyan-500' 
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-600'
                                    }`}
                                    onClick={() => handleSubcategoryChange(sub.id)}
                                    data-testid={`subcategory-${sub.id}`}
                                >
                                    {sub.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={`Buscar em ${title}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12"
                                data-testid="category-search-input"
                            />
                        </div>
                        <Button type="submit" className="btn-primary h-12 px-6" data-testid="category-search-button">
                            Buscar
                        </Button>
                    </form>

                    <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] h-12" data-testid="category-sort-select">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="hidden md:flex border rounded-lg dark:border-slate-700">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <Grid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Mobile Filters */}
                        <Sheet>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="outline" size="icon" className="h-12 w-12">
                                    <SlidersHorizontal className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filtros</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-4">
                                    <div>
                                        <p className="font-medium mb-3">Subcategorias</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant={activeSubcategory === 'all' ? 'default' : 'outline'}
                                                className={`cursor-pointer ${activeSubcategory === 'all' ? 'bg-sky-500 dark:bg-cyan-600' : 'dark:border-slate-600'}`}
                                                onClick={() => handleSubcategoryChange('all')}
                                            >
                                                Todos
                                            </Badge>
                                            {subcategories.map(sub => (
                                                <Badge
                                                    key={sub.id}
                                                    variant={activeSubcategory === sub.id ? 'default' : 'outline'}
                                                    className={`cursor-pointer ${activeSubcategory === sub.id ? 'bg-sky-500 dark:bg-cyan-600' : 'dark:border-slate-600'}`}
                                                    onClick={() => handleSubcategoryChange(sub.id)}
                                                >
                                                    {sub.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Results count */}
                {!loading && hasSearched && (
                    <p className="text-sm text-muted-foreground mb-6">
                        {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
                        {activeSubcategory !== 'all' && subcategories.find(s => s.id === activeSubcategory) && (
                            <span> em <strong>{subcategories.find(s => s.id === activeSubcategory)?.name}</strong></span>
                        )}
                    </p>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        <LoadingSkeleton type="card" count={8} />
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <EmptyState 
                        type="products" 
                        action={
                            <Button onClick={() => { 
                                setSearchTerm(''); 
                                setActiveSubcategory('all'); 
                                setSearchParams({});
                                fetchProducts(defaultSearch); 
                            }}>
                                Limpar filtros
                            </Button>
                        }
                    />
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`} data-testid="category-products-grid">
                        {sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* SEO Content */}
                {!loading && sortedProducts.length > 0 && (
                    <div className="mt-16 pt-8 border-t dark:border-slate-800">
                        <div className="max-w-3xl">
                            <h2 className="text-xl font-semibold mb-4">
                                Por que comparar preços de {title}?
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                No EconomizeBem, você encontra os melhores preços de {title.toLowerCase()} comparando 
                                ofertas de diversas lojas em tempo real. Economize tempo e dinheiro encontrando 
                                exatamente o que procura pelo menor preço disponível. Crie alertas de preço e 
                                seja notificado quando o produto atingir o valor desejado.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
