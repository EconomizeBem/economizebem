import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
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
import { AdSenseInFeed } from '../components/AdSenseBlock';

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

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState('price_asc');
    const [viewMode, setViewMode] = useState('grid');

    // Efeito para buscar produtos quando a página carrega ou quando os parâmetros mudam
    useEffect(() => {
        const searchFromUrl = searchParams.get('search') || '';
        const categoryFromUrl = searchParams.get('category') || 'all';
        
        // Atualizar estados locais se vieram da URL
        if (searchFromUrl !== searchTerm) {
            setSearchTerm(searchFromUrl);
        }
        if (categoryFromUrl !== category) {
            setCategory(categoryFromUrl);
        }
        
        // Buscar produtos
        fetchProducts(searchFromUrl, categoryFromUrl);
    }, [searchParams]);

    const fetchProducts = async (search = searchTerm, cat = category) => {
        setLoading(true);
        setError(null);
        
        const query = search?.trim() || '';
        const categoryParam = cat !== 'all' ? cat : null;
        
        try {
            const response = await productsApi.getAll(query, categoryParam);
            setProducts(response.data || []);
            
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
            if (query) prev.set('search', query);
            else prev.delete('search');
            return prev;
        });
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        setSearchParams(prev => {
            if (newCategory !== 'all') prev.set('category', newCategory);
            else prev.delete('category');
            return prev;
        });
    };

    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc': return a.best_price - b.best_price;
            case 'price_desc': return b.best_price - a.best_price;
            case 'rating': 
                const ratingA = Math.max(...a.stores.map(s => s.rating));
                const ratingB = Math.max(...b.stores.map(s => s.rating));
                return ratingB - ratingA;
            case 'discount':
                const discountA = a.stores[0]?.original_price ? 
                    (a.stores[0].original_price - a.best_price) / a.stores[0].original_price : 0;
                const discountB = b.stores[0]?.original_price ? 
                    (b.stores[0].original_price - b.best_price) / b.stores[0].original_price : 0;
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

                        <div className="hidden md:flex border rounded-lg">
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
                            <Button onClick={() => { setSearchTerm(''); setCategory('all'); fetchProducts(); }}>
                                Limpar filtros
                            </Button>
                        }
                    />
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`} data-testid="products-grid">
                        {sortedProducts.map((product, index) => (
                            <>
                                <ProductCard key={product.id} product={product} />
                                {/* Inserir anúncio a cada 8 produtos */}
                                {(index + 1) % 8 === 0 && index < sortedProducts.length - 1 && (
                                    <div key={`ad-${index}`} className="col-span-full">
                                        <AdSenseInFeed adSlot="SLOT_PRODUCTS_INFEED" />
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
