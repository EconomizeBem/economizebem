import { Helmet } from 'react-helmet';
import { ExternalLink, Tag, Star, Clock, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

// Produtos com links de afiliado Amazon
const amazonProducts = [
    {
        id: 1,
        name: "Ventilador WAP Flow Turbo",
        description: "Potente, econômico e ideal para os dias quentes. Circulação de ar eficiente com baixo consumo de energia.",
        link: "https://amzn.to/45UX6o8",
        image: "https://images.unsplash.com/photo-1558247234-9e4380e897be?w=400&h=400&fit=crop",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    },
    {
        id: 2,
        name: "Kit Material Escolar Volta às Aulas MZCell",
        description: "Mochila e itens essenciais para estudantes. Tudo que você precisa para começar o ano letivo.",
        link: "https://amzn.to/4a3sD9U",
        image: "https://images.unsplash.com/photo-1725801731061-041393837983?w=400&h=400&fit=crop",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 3,
        name: "Caneta Esferográfica Faber-Castell Trilux 032",
        description: "Escrita macia e alta durabilidade. Kit com múltiplas unidades para uso diário.",
        link: "https://amzn.to/45YL8i6",
        image: "https://images.unsplash.com/photo-1553101568-34bd00376c40?w=400&h=400&fit=crop",
        badge: null,
        badgeColor: null
    },
    {
        id: 4,
        name: "Kit com 15 Potes Herméticos para Alimentos",
        description: "Organização e vedação eficiente para sua cozinha. Mantém alimentos frescos por mais tempo.",
        link: "https://amzn.to/4tonMyh",
        image: "https://images.unsplash.com/photo-1621318551436-68573392fd5c?w=400&h=400&fit=crop",
        badge: "Oferta Limitada",
        badgeColor: "bg-red-500"
    },
    {
        id: 5,
        name: "Aspirador de Pó Vertical WAP Silent Speed Max",
        description: "Compacto, potente e prático. Limpeza silenciosa com alto poder de sucção.",
        link: "https://amzn.to/3LXAw7I",
        image: "https://images.unsplash.com/photo-1762859731349-c9ff2808b672?w=400&h=400&fit=crop",
        badge: "Top Avaliado",
        badgeColor: "bg-blue-500"
    },
    {
        id: 6,
        name: "Kit Cafeteira Nescafé Dolce Gusto",
        description: "Bebidas variadas em cápsulas. Café, cappuccino, chocolate e muito mais com praticidade.",
        link: "https://amzn.to/4krHyGr",
        image: "https://images.unsplash.com/photo-1680539882932-559b099446cc?w=400&h=400&fit=crop",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    },
    {
        id: 7,
        name: "Cartão de Memória SanDisk Micro SD 128GB",
        description: "Velocidade e armazenamento confiável. Ideal para celulares, câmeras e dispositivos portáteis.",
        link: "https://amzn.to/45OY7y4",
        image: "https://images.unsplash.com/photo-1610415390997-2538c1167943?w=400&h=400&fit=crop",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 8,
        name: "Cafeteira Elétrica Electrolux ECM25",
        description: "Até 30 xícaras, prática para o dia a dia. Perfeita para famílias e escritórios.",
        link: "https://amzn.to/4tpsWTV",
        image: "https://images.unsplash.com/photo-1628195441391-e444b7a0516c?w=400&h=400&fit=crop",
        badge: null,
        badgeColor: null
    },
    {
        id: 9,
        name: "Câmera de Vigilância Mercusys MC210",
        description: "Visão 360°, Wi-Fi, 2K, áudio bidirecional. Segurança inteligente para sua casa ou empresa.",
        link: "https://amzn.to/4r4AkCG",
        image: "https://images.unsplash.com/photo-1752116761763-19d288c61d65?w=400&h=400&fit=crop",
        badge: "Top Avaliado",
        badgeColor: "bg-blue-500"
    },
    {
        id: 10,
        name: "PlayStation 5 Slim + Pacote Astro/Gran Turismo",
        description: "Nova geração de games com gráficos impressionantes. Inclui jogos exclusivos de lançamento.",
        link: "https://amzn.to/4r5pT1G",
        image: "https://images.unsplash.com/photo-1689593671231-ea788fda8414?w=400&h=400&fit=crop",
        badge: "Destaque",
        badgeColor: "bg-purple-500"
    },
    {
        id: 11,
        name: "Mala de Viagem Samsonite Upscape",
        description: "Resistente, leve e ideal para viagens. Rodas 360° e materiais de alta qualidade.",
        link: "https://amzn.to/4kjSbCY",
        image: "https://images.unsplash.com/photo-1714235058831-41227b8be9bf?w=400&h=400&fit=crop",
        badge: "Premium",
        badgeColor: "bg-slate-700"
    },
    {
        id: 12,
        name: "Smart TV Aiwa 50\" Android 4K",
        description: "HDR, Dolby Áudio e Android TV. Entretenimento completo com apps integrados.",
        link: "https://amzn.to/4a5VMBQ",
        image: "https://images.unsplash.com/photo-1730909352933-614f1673ac21?w=400&h=400&fit=crop",
        badge: "Oferta Limitada",
        badgeColor: "bg-red-500"
    },
    {
        id: 13,
        name: "Cadeira Gamer Elite Pro Dazz",
        description: "Conforto, ajuste e ergonomia para longas sessões. Design moderno com apoio lombar.",
        link: "https://amzn.to/4rAHHsg",
        image: "https://images.unsplash.com/photo-1770195555068-37103df33bf8?w=400&h=400&fit=crop",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    }
];

export default function AmazonOffersPage() {
    return (
        <>
            <Helmet>
                <title>Ofertas Amazon - Promoções e Descontos | EconomizeBem</title>
                <meta name="description" content="Melhores ofertas da Amazon selecionadas pelo EconomizeBem. Promoções em eletrônicos, casa, tecnologia e muito mais. Compre mais barato com links diretos." />
                <meta name="keywords" content="ofertas Amazon, promoções Amazon, EconomizeBem, comprar mais barato, descontos Amazon, melhores preços" />
                <link rel="canonical" href="https://economizebem.com.br/ofertas-amazon" />
                <meta property="og:title" content="Ofertas Amazon - Promoções e Descontos | EconomizeBem" />
                <meta property="og:description" content="Melhores ofertas da Amazon selecionadas pelo EconomizeBem. Promoções em eletrônicos, casa, tecnologia e muito mais." />
                <meta property="og:type" content="website" />
            </Helmet>

            <div className="min-h-screen py-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="container-main">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-4">
                            <Tag className="w-4 h-4" />
                            Curadoria EconomizeBem
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-['Manrope']">
                            Ofertas Amazon
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Selecionamos os melhores produtos com foco em economia, utilidade e qualidade. 
                            Clique e aproveite os preços especiais direto na Amazon.
                        </p>
                        
                        {/* Trust badges */}
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Star className="w-4 h-4 text-amber-500" />
                                <span>Produtos avaliados</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 text-sky-500" />
                                <span>Ofertas atualizadas</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Zap className="w-4 h-4 text-emerald-500" />
                                <span>Entrega rápida</span>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="amazon-products-grid">
                        {amazonProducts.map((product) => (
                            <div 
                                key={product.id}
                                className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                data-testid={`amazon-product-${product.id}`}
                            >
                                {/* Badge */}
                                {product.badge && (
                                    <Badge className={`absolute top-3 left-3 z-10 ${product.badgeColor} text-white text-xs px-2 py-1`}>
                                        {product.badge}
                                    </Badge>
                                )}
                                
                                {/* Image */}
                                <div className="relative aspect-square bg-white p-4 flex items-center justify-center">
                                    <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                                
                                {/* Content */}
                                <div className="flex flex-col flex-1 p-4 pt-2">
                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">
                                        {product.description}
                                    </p>
                                    
                                    {/* CTA Button */}
                                    <a 
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer sponsored"
                                        className="w-full"
                                    >
                                        <Button 
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm h-10 group/btn"
                                            data-testid={`amazon-cta-${product.id}`}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Ver oferta na Amazon
                                            <ExternalLink className="w-3 h-3 ml-2 opacity-70 group-hover/btn:opacity-100" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer info */}
                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-sm text-muted-foreground">
                            <TrendingUp className="w-4 h-4" />
                            <span>Página atualizada com ofertas selecionadas</span>
                        </div>
                        
                        <p className="mt-6 text-xs text-muted-foreground max-w-xl mx-auto">
                            Esta página contém links de afiliados do Programa de Associados da Amazon. 
                            Ao comprar através dos links, você apoia o EconomizeBem sem custo adicional.
                        </p>
                    </div>

                    {/* SEO Content */}
                    <div className="mt-16 pt-8 border-t dark:border-slate-800">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-xl font-semibold mb-4">
                                Por que comprar pela Amazon via EconomizeBem?
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                No EconomizeBem, selecionamos as melhores ofertas da Amazon com foco em economia e qualidade. 
                                Todos os produtos são avaliados e escolhidos para garantir que você encontre 
                                o melhor custo-benefício. Compre com segurança através dos links oficiais 
                                do Programa de Associados Amazon e aproveite entregas rápidas com Amazon Prime.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
