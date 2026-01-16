import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
    Search, 
    TrendingDown, 
    Bell, 
    Calculator,
    ArrowRight,
    Wifi,
    Smartphone,
    Tv,
    ShieldCheck,
    Zap,
    PiggyBank,
    Wallet,
    BadgePercent,
    Clock,
    Loader2
} from 'lucide-react';

const features = [
    {
        icon: <TrendingDown className="w-6 h-6" />,
        title: 'Compare preços entre as principais lojas online',
        description: 'Amazon, Magazine Luiza, Mercado Livre, Casas Bahia e mais.'
    },
    {
        icon: <Wifi className="w-6 h-6" />,
        title: 'Compare planos de internet, celular e streaming',
        description: 'Em breve: encontre o melhor custo-benefício entre operadoras.',
        comingSoon: true
    },
    {
        icon: <Calculator className="w-6 h-6" />,
        title: 'Controle seus gastos e saiba onde economizar',
        description: 'Ferramentas financeiras simples para organizar suas finanças.'
    },
    {
        icon: <Bell className="w-6 h-6" />,
        title: 'Receba alertas de preços direto no seu e-mail',
        description: 'Seja notificado quando o produto atingir seu preço ideal.'
    }
];

const categories = [
    { icon: <Smartphone className="w-8 h-8" />, name: 'Smartphones', link: '/products?category=smartphones' },
    { icon: <Tv className="w-8 h-8" />, name: 'TVs', link: '/products?category=tvs' },
    { icon: <Wifi className="w-8 h-8" />, name: 'Planos', link: '/plans', comingSoon: true },
    { icon: <Calculator className="w-8 h-8" />, name: 'Calculadora', link: '/calculator' },
];

export default function HomePage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e?.preventDefault();
        
        const query = searchQuery.trim();
        
        // Validação: mínimo 2 caracteres
        if (query.length < 2) {
            toast.error('Digite pelo menos 2 caracteres para buscar');
            return;
        }
        
        setIsSearching(true);
        
        try {
            // Navegar para a página de produtos com o termo de busca
            navigate(`/products?search=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error('Erro ao buscar:', error);
            toast.error('Erro ao buscar produtos. Tente novamente.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden hero-gradient-light dark:hero-gradient-dark" data-testid="hero-section">
                <div className="container-main py-20 md:py-28">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 slide-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-cyan-900/30 text-sky-600 dark:text-cyan-400 text-sm font-medium">
                                <BadgePercent className="w-4 h-4" />
                                Economia inteligente para você
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-['Outfit']">
                                Compare preços e{' '}
                                <span className="text-gradient">economize de verdade</span>
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                                Encontre as melhores ofertas, compare planos e organize suas finanças em um só lugar. Simples, rápido e gratuito.
                            </p>
                            
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="relative max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    className="input-search"
                                    data-testid="hero-search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSearching}
                                />
                                <Button 
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary rounded-xl h-10 px-6"
                                    data-testid="hero-search-button"
                                    disabled={isSearching}
                                >
                                    {isSearching ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Buscar'
                                    )}
                                </Button>
                            </form>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4">
                                <Link to="/products">
                                    <Button className="btn-primary rounded-xl h-12 px-8 text-base" data-testid="get-started-btn">
                                        Começar a economizar
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="outline" className="rounded-xl h-12 px-8 text-base border-slate-300 dark:border-cyan-700/50 dark:text-slate-100 dark:hover:bg-cyan-900/30 dark:hover:border-cyan-600" data-testid="create-account-btn">
                                        Criar conta gratuita
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right - Stats Cards */}
                        <div className="hidden md:flex relative items-center justify-center">
                            <div className="grid grid-cols-2 gap-4 max-w-sm">
                                {/* Stat Card 1 */}
                                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700 float-animation">
                                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center mb-3">
                                        <Zap className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                                    </div>
                                    <p className="text-2xl font-bold">Rápido</p>
                                    <p className="text-sm text-muted-foreground">Compare em segundos</p>
                                </div>
                                
                                {/* Stat Card 2 */}
                                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700 float-animation" style={{ animationDelay: '1s' }}>
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center mb-3">
                                        <PiggyBank className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                    </div>
                                    <p className="text-2xl font-bold">6+ lojas</p>
                                    <p className="text-sm text-muted-foreground">Monitoradas</p>
                                </div>
                                
                                {/* Stat Card 3 */}
                                <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 shadow-lg border border-slate-100 dark:border-slate-700 float-animation col-span-2" style={{ animationDelay: '0.5s' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">100% Gratuito</p>
                                            <p className="text-sm text-muted-foreground">Sem cadastro obrigatório</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Categories */}
            <section className="py-12 border-b dark:border-slate-800" data-testid="categories-section">
                <div className="container-main">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat, idx) => (
                            <Link 
                                key={idx} 
                                to={cat.link}
                                className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-cyan-900/20 border border-transparent hover:border-sky-200 dark:hover:border-cyan-700/50 transition-all group"
                            >
                                {cat.comingSoon && (
                                    <Badge variant="secondary" className="absolute top-2 right-2 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs px-2 py-0.5">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Em breve
                                    </Badge>
                                )}
                                <div className="text-slate-400 group-hover:text-sky-500 dark:group-hover:text-cyan-400 transition-colors">
                                    {cat.icon}
                                </div>
                                <span className="font-medium">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20" data-testid="features-section">
                <div className="container-main">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Outfit']">
                            Tudo que você precisa para{' '}
                            <span className="text-gradient">economizar</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Nosso objetivo é ajudar você a gastar menos e decidir melhor.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <div 
                                key={idx}
                                className="feature-card group p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 card-hover relative"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                {feature.comingSoon && (
                                    <Badge variant="secondary" className="absolute top-3 right-3 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs px-2 py-0.5">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Em breve
                                    </Badge>
                                )}
                                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-cyan-900/40 flex items-center justify-center text-sky-500 dark:text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900/50" data-testid="trust-section">
                <div className="container-main">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Outfit']">
                                Por que usar o{' '}
                                <span className="text-gradient">EconomizeBem</span>?
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-500 flex-shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">100% Gratuito</h4>
                                        <p className="text-muted-foreground text-sm">Sem taxas escondidas. Use todas as funcionalidades gratuitamente.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-500 flex-shrink-0">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Dados em Tempo Real</h4>
                                        <p className="text-muted-foreground text-sm">Preços atualizados diariamente das principais lojas.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-500 dark:text-amber-400 flex-shrink-0">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Alertas Inteligentes</h4>
                                        <p className="text-muted-foreground text-sm">Seja notificado quando encontrarmos o melhor preço para você.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-sky-500 to-violet-500 dark:from-cyan-600 dark:to-violet-600 rounded-3xl p-8 text-white">
                                <Wallet className="w-12 h-12 mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Comparação em tempo real</h3>
                                <p className="text-sky-100 dark:text-cyan-100 mb-6">
                                    Buscamos os melhores preços nas principais lojas do Brasil para você economizar.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <p className="text-3xl font-bold">6+</p>
                                        <p className="text-sm text-sky-100 dark:text-cyan-100">Lojas monitoradas</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <p className="text-3xl font-bold">24h</p>
                                        <p className="text-sm text-sky-100 dark:text-cyan-100">Atualização de preços</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20" data-testid="cta-section">
                <div className="container-main">
                    <div className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-cyan-700 dark:to-cyan-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Outfit']">
                                Pronto para começar a economizar?
                            </h2>
                            <p className="text-lg text-sky-100 dark:text-cyan-100 mb-8 max-w-xl mx-auto">
                                Crie sua conta gratuita e tenha acesso a todas as ferramentas de economia.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to="/register">
                                    <Button className="bg-white text-sky-600 hover:bg-sky-50 rounded-xl h-12 px-8 text-base font-semibold shadow-lg">
                                        Criar conta gratuita
                                    </Button>
                                </Link>
                                <Link to="/products">
                                    <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl h-12 px-8 text-base">
                                        Explorar produtos
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
