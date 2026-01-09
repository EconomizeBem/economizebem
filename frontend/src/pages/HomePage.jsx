import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
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
    PiggyBank
} from 'lucide-react';

const features = [
    {
        icon: <TrendingDown className="w-6 h-6" />,
        title: 'Compare preços entre as principais lojas online',
        description: 'Amazon, Magazine Luiza, Mercado Livre, Shopee e mais.'
    },
    {
        icon: <Wifi className="w-6 h-6" />,
        title: 'Descubra o melhor plano de internet, celular ou streaming',
        description: 'Compare operadoras e encontre o melhor custo-benefício.'
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
    { icon: <Wifi className="w-8 h-8" />, name: 'Internet', link: '/plans?tab=internet' },
    { icon: <Calculator className="w-8 h-8" />, name: 'Calculadora', link: '/calculator' },
];

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden hero-gradient-light dark:hero-gradient-dark" data-testid="hero-section">
                <div className="container-main py-20 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8 slide-up">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-['Manrope']">
                                Compare preços, economize dinheiro e faça{' '}
                                <span className="text-gradient">escolhas inteligentes</span>.
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                                Encontre as melhores ofertas, compare planos e organize suas finanças em um só lugar.
                            </p>
                            
                            {/* Search Bar */}
                            <div className="relative max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    className="input-search"
                                    data-testid="hero-search-input"
                                />
                                <Button 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary rounded-full h-10 px-6"
                                    data-testid="hero-search-button"
                                >
                                    Buscar
                                </Button>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4">
                                <Link to="/products">
                                    <Button className="btn-primary rounded-full h-12 px-8 text-base" data-testid="get-started-btn">
                                        Começar a economizar agora
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="outline" className="rounded-full h-12 px-8 text-base" data-testid="create-account-btn">
                                        Criar conta gratuita
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right - Hero Image */}
                        <div className="hidden md:block relative">
                            <div className="relative z-10">
                                <img 
                                    src="https://images.unsplash.com/photo-1590214873614-1e1b613d542c?w=600&q=80"
                                    alt="Família economizando"
                                    className="rounded-2xl shadow-2xl"
                                />
                            </div>
                            {/* Floating Cards */}
                            <div className="absolute -top-4 -right-4 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-lg z-20 scale-in">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                        <PiggyBank className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Economia média</p>
                                        <p className="text-emerald-600 font-bold">R$ 250/mês</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-lg z-20 scale-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Comparações</p>
                                        <p className="text-indigo-600 font-bold">+50.000</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Categories */}
            <section className="py-12 border-b" data-testid="categories-section">
                <div className="container-main">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.map((cat, idx) => (
                            <Link 
                                key={idx} 
                                to={cat.link}
                                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                            >
                                <div className="text-muted-foreground group-hover:text-emerald-600 transition-colors">
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Manrope']">
                            Tudo que você precisa para{' '}
                            <span className="text-gradient">economizar</span>
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Nosso objetivo é ajudar você a gastar menos e decidir melhor.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <div 
                                key={idx}
                                className="group p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 card-hover"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
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
            <section className="py-20 bg-zinc-50 dark:bg-zinc-950" data-testid="trust-section">
                <div className="container-main">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Manrope']">
                                Por que confiar no{' '}
                                <span className="text-gradient">Economizaí</span>?
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">100% Gratuito</h4>
                                        <p className="text-muted-foreground text-sm">Sem taxas escondidas. Use todas as funcionalidades gratuitamente.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Dados em Tempo Real</h4>
                                        <p className="text-muted-foreground text-sm">Preços atualizados diariamente das principais lojas.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
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
                            <img 
                                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80"
                                alt="Economia"
                                className="rounded-2xl shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20" data-testid="cta-section">
                <div className="container-main">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-16 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Manrope']">
                            Pronto para começar a economizar?
                        </h2>
                        <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                            Crie sua conta gratuita e tenha acesso a todas as ferramentas de economia.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link to="/register">
                                <Button className="bg-white text-emerald-600 hover:bg-zinc-100 rounded-full h-12 px-8 text-base font-semibold">
                                    Criar conta gratuita
                                </Button>
                            </Link>
                            <Link to="/products">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full h-12 px-8 text-base">
                                    Explorar produtos
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
