import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List, SlidersHorizontal, ChevronDown, Loader2 } from 'lucide-react';
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

const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'tvs', name: 'TVs' },
    { id: 'notebooks', name: 'Notebooks' },
    { id: 'games', name: 'Games' },
    { id: 'eletrodomesticos', name: 'Eletrodomésticos' },
    { id: 'acessorios', name: 'Acessórios' },
];

const sortOptions = [
    { value: 'price_asc', label: 'Menor preço' },
    { value: 'price_desc', label: 'Maior preço' },
    { value: 'rating', label: 'Melhor avaliação' },
    { value: 'discount', label: 'Maior desconto' },
];

const PAGE_SIZE = 20;

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('price_asc');
    const [viewMode, setViewMode] = useState('grid');
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [endMessage, setEndMessage] = useState(null);
    
    const fetchingRef = useRef(false);
    const debounceRef = useRef(null);

    // Função de busca
    const fetchProducts = useCallback(async (search, cat, page = 1, append = false) => {
        if (fetchingRef.current && !append) return;
        fetchingRef.current = true;
        
        if (page === 1) {
            setLoading(true);
            setEndMessage(null);
        } else {
            setLoadingMore(true);
        }
        
        const query = search?.trim() || '';
        const categoryParam = cat !== 'all' ? cat : null;
        
        try {
            const response = await productsApi.getAll(query, categoryParam, page, PAGE_SIZE);
            const data = response.data;
            
            // Extrair produtos da resposta
            let newProducts = [];
            if (data && typeof data === 'object') {
                if (Array.isArray(data.products)) {
                    newProducts = data.products;
                } else if (Array.isArray(data)) {
                    newProducts = data;
                }
            } else if (Array.isArray(data)) {
                newProducts = data;
            }
            
            const responseHasMore = data?.has_more ?? false;
            const responseMessage = data?.message;
            
            if (append) {
                setProducts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNew = newProducts.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNew];
                });
            } else {
                setProducts(newProducts);
            }
            
            setHasMore(responseHasMore);
            setCurrentPage(page);
            
            if (responseMessage) {
                setEndMessage(responseMessage);
            }
            
            if (newProducts.length === 0 && page === 1 && query) {
                toast.info(`Nenhum produto encontrado para "${query}"`);
            }
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            toast.error('Erro ao buscar produtos. Tente novamente.');
            if (!append) setProducts([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            fetchingRef.current = false;
        }
    }, []);

    // Efeito para buscar quando parâmetros mudam
    useEffect(() => {
        const searchFromUrl = searchParams.get('search') || '';
        const categoryFromUrl = searchParams.get('category') || 'all';
        
        setSearchTerm(searchFromUrl);
        setCategory(categoryFromUrl);
        setCurrentPage(1);
        setHasMore(false);
        setProducts([]);
        
        fetchProducts(searchFromUrl, categoryFromUrl, 1, false);
    }, [searchParams, fetchProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        const newParams = new URLSearchParams();
        if (query) newParams.set('search', query);
        if (category !== 'all') newParams.set('category', category);
        setSearchParams(newParams);
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        
        const newParams = new URLSearchParams();
        if (searchTerm) newParams.set('search', searchTerm);
        if (newCategory !== 'all') newParams.set('category', newCategory);
        setSearchParams(newParams);
    };

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingMore || fetchingRef.current) return;
        
        const searchFromUrl = searchParams.get('search') || '';
        const categoryFromUrl = searchParams.get('category') || 'all';
        
        fetchProducts(searchFromUrl, categoryFromUrl, currentPage + 1, true);
    }, [hasMore, loadingMore, searchParams, currentPage, fetchProducts]);

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc': return (a.best_price || 0) - (b.best_price || 0);
            case 'price_desc': return (b.best_price || 0) - (a.best_price || 0);
            case 'rating': 
                const ratingA = Math.max(...(a.stores?.map(s => s.rating || 0) || [0]));
                const ratingB = Math.max(...(b.stores?.map(s => s.rating || 0) || [0]));
                return ratingB - ratingA;
            case 'discount':
                const discountA = a.stores?.[0]?.original_price ? 
                    (a.stores[0].original_price - (a.best_price || 0)) / a.stores[0].original_price : 0;
                const discountB = b.stores?.[0]?.original_price ? 
                    (b.stores[0].original_price - (b.best_price || 0)) / b.stores[0].original_price : 0;
                return discountB - discountA;
            default: return 0;
        }
    });

    return (
        <div className="min-h-screen py-8" data-testid="products-page">
            <div className="container-main">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Manrope']">
                        Comparar Produtos
                    </h1>
                    <p className="text-muted-foreground">
                        Encontre o melhor preço entre as principais lojas do Brasil
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12"
                                data-testid="search-input"
                            />
                        </div>
                        <Button type="submit" className="btn-primary h-12 px-6" data-testid="search-button">
                            Buscar
                        </Button>
                    </form>

                    <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] h-12" data-testid="sort-select">
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
                                        <p className="font-medium mb-3">Categorias</p>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <Badge
                                                    key={cat.id}
                                                    variant={category === cat.id ? 'default' : 'outline'}
                                                    className={`cursor-pointer ${category === cat.id ? 'bg-sky-500 dark:bg-cyan-600' : 'dark:border-slate-600'}`}
                                                    onClick={() => handleCategoryChange(cat.id)}
                                                >
                                                    {cat.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* Categories - Desktop */}
                <div className="hidden md:flex flex-wrap gap-2 mb-8">
                    {categories.map(cat => (
                        <Badge
                            key={cat.id}
                            variant={category === cat.id ? 'default' : 'outline'}
                            className={`cursor-pointer px-4 py-2 text-sm ${category === cat.id ? 'bg-sky-500 dark:bg-cyan-600 hover:bg-sky-600 dark:hover:bg-cyan-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-600'}`}
                            onClick={() => handleCategoryChange(cat.id)}
                            data-testid={`category-${cat.id}`}
                        >
                            {cat.name}
                        </Badge>
                    ))}
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-sm text-muted-foreground mb-6">
                        {sortedProducts.length} produto{sortedProducts.length !== 1 ? 's' : ''} encontrado{sortedProducts.length !== 1 ? 's' : ''}
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
                                setCategory('all'); 
                                setSearchParams(new URLSearchParams());
                            }}>
                                Limpar filtros
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`} data-testid="products-grid">
                            {sortedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        
                        {/* Botão Carregar Mais */}
                        <div className="mt-10 flex flex-col items-center gap-4">
                            {hasMore && !endMessage && (
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    variant="outline"
                                    size="lg"
                                    className="min-w-[220px]"
                                    data-testid="load-more-button"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4 mr-2" />
                                            Carregar mais produtos
                                        </>
                                    )}
                                </Button>
                            )}
                            
                            {endMessage && (
                                <p className="text-sm text-muted-foreground text-center px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    {endMessage}
                                </p>
                            )}
                            
                            {!hasMore && !endMessage && sortedProducts.length >= PAGE_SIZE && (
                                <p className="text-sm text-muted-foreground text-center px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    Refine sua busca para ver mais resultados.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
