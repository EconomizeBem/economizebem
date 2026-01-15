import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
    Wifi, 
    Smartphone, 
    Tv, 
    Clock, 
    Bell,
    Sparkles,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlansPage() {
    const [activeTab, setActiveTab] = useState('internet');

    const upcomingFeatures = {
        internet: [
            'Comparação entre Vivo, Claro, Tim, Oi e mais',
            'Filtro por velocidade e preço',
            'Indicação de melhor custo-benefício',
            'Alertas de promoções'
        ],
        mobile: [
            'Planos pós-pago e controle',
            'Comparação de franquia de dados',
            'Filtro por operadora',
            'Benefícios inclusos (apps ilimitados)'
        ],
        streaming: [
            'Netflix, Disney+, HBO Max, Prime Video e mais',
            'Comparação de catálogo e preço',
            'Número de telas simultâneas',
            'Qualidade de vídeo (HD, 4K)'
        ]
    };

    const tabInfo = {
        internet: {
            title: 'Internet Fixa',
            description: 'Compare planos de internet fibra das principais operadoras do Brasil',
            icon: <Wifi className="w-16 h-16" />,
            color: 'sky'
        },
        mobile: {
            title: 'Planos de Celular',
            description: 'Encontre o melhor plano de celular para suas necessidades',
            icon: <Smartphone className="w-16 h-16" />,
            color: 'violet'
        },
        streaming: {
            title: 'Streaming',
            description: 'Compare os principais serviços de streaming disponíveis no Brasil',
            icon: <Tv className="w-16 h-16" />,
            color: 'amber'
        }
    };

    const currentTab = tabInfo[activeTab];

    return (
        <div className="min-h-screen py-8" data-testid="plans-page">
            <div className="container-main">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold font-['Manrope']">
                            Comparar Planos
                        </h1>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Em breve
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Estamos trabalhando para trazer comparações reais de planos para você
                    </p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid grid-cols-3 h-14 max-w-md">
                        <TabsTrigger value="internet" className="h-12 gap-2" data-testid="tab-internet">
                            <Wifi className="w-4 h-4" />
                            <span className="hidden sm:inline">Internet</span>
                        </TabsTrigger>
                        <TabsTrigger value="mobile" className="h-12 gap-2" data-testid="tab-mobile">
                            <Smartphone className="w-4 h-4" />
                            <span className="hidden sm:inline">Celular</span>
                        </TabsTrigger>
                        <TabsTrigger value="streaming" className="h-12 gap-2" data-testid="tab-streaming">
                            <Tv className="w-4 h-4" />
                            <span className="hidden sm:inline">Streaming</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Coming Soon Card */}
                <div className="max-w-3xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 md:p-12">
                        {/* Background decoration */}
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-${currentTab.color}-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl`}></div>
                        <div className={`absolute bottom-0 left-0 w-48 h-48 bg-${currentTab.color}-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl`}></div>
                        
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className={`w-24 h-24 rounded-2xl bg-${currentTab.color}-100 dark:bg-${currentTab.color}-900/30 flex items-center justify-center text-${currentTab.color}-500 mb-6 mx-auto`}>
                                {currentTab.icon}
                            </div>

                            {/* Content */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
                                    <Sparkles className="w-4 h-4" />
                                    Funcionalidade em desenvolvimento
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3 font-['Outfit']">
                                    {currentTab.title}
                                </h2>
                                <p className="text-muted-foreground max-w-lg mx-auto">
                                    {currentTab.description}. Em breve você poderá comparar e encontrar o melhor custo-benefício.
                                </p>
                            </div>

                            {/* Features list */}
                            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 mb-8">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-sky-500" />
                                    O que você poderá fazer:
                                </h3>
                                <ul className="space-y-3">
                                    {upcomingFeatures[activeTab].map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-muted-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register">
                                    <Button className="btn-primary rounded-xl h-12 px-8 gap-2">
                                        <Bell className="w-4 h-4" />
                                        Avise-me quando lançar
                                    </Button>
                                </Link>
                                <Link to="/products">
                                    <Button variant="outline" className="rounded-xl h-12 px-8 gap-2">
                                        Comparar produtos agora
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Info cards */}
                    <div className="grid md:grid-cols-3 gap-4 mt-8">
                        <div className="p-6 rounded-xl border bg-card text-center">
                            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-500 mx-auto mb-3">
                                <Wifi className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold mb-1">Internet</h4>
                            <p className="text-sm text-muted-foreground">Fibra óptica e banda larga</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-card text-center">
                            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-500 mx-auto mb-3">
                                <Smartphone className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold mb-1">Celular</h4>
                            <p className="text-sm text-muted-foreground">Pós-pago e controle</p>
                        </div>
                        <div className="p-6 rounded-xl border bg-card text-center">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 mx-auto mb-3">
                                <Tv className="w-6 h-6" />
                            </div>
                            <h4 className="font-semibold mb-1">Streaming</h4>
                            <p className="text-sm text-muted-foreground">Filmes e séries</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
