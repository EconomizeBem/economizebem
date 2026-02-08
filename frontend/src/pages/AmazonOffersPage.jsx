import { Helmet } from 'react-helmet';
import { ExternalLink, Star, Clock, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';

// URL base da API para proxy de imagens
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Função para gerar URL do proxy de imagem Amazon
const getProxyImageUrl = (amazonImageUrl) => {
    if (!amazonImageUrl) return null;
    return `${API_URL}/api/proxy/image?url=${encodeURIComponent(amazonImageUrl)}`;
};

// LISTA OFICIAL E FINAL DE PRODUTOS - Links de Afiliado EXATOS e Imagens OFICIAIS da Amazon
// URLs de imagem testadas e validadas para funcionar com o proxy
const amazonProducts = [
    {
        id: 1,
        name: "PlayStation 5",
        description: "Console de nova geração com gráficos impressionantes, SSD ultrarrápido e controle DualSense com feedback tátil.",
        link: "https://amzn.to/4r5pT1C",
        image: "https://m.media-amazon.com/images/I/71WCygaQDAL._AC_SY355_.jpg",
        badge: "Destaque",
        badgeColor: "bg-purple-500"
    },
    {
        id: 2,
        name: "Mala Upscape",
        description: "Mala de viagem resistente, leve e com rodas 360°. Ideal para viagens nacionais e internacionais.",
        link: "https://amzn.to/4kjSbCY",
        image: "https://m.media-amazon.com/images/I/71PwhBGpHIL._AC_UL320_.jpg",
        badge: "Premium",
        badgeColor: "bg-slate-700"
    },
    {
        id: 3,
        name: "Poltrona Gamer",
        description: "Cadeira gamer ergonômica com ajuste de altura, apoio lombar e braços reguláveis. Conforto para longas sessões.",
        link: "https://amzn.to/4rAHHS9",
        image: "https://m.media-amazon.com/images/I/613NfdEWPyL._AC_SY355_.jpg",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 4,
        name: "TV 50 Polegadas Aiwa",
        description: "Smart TV 4K com Android TV, HDR e Dolby Audio. Entretenimento completo com apps integrados.",
        link: "https://amzn.to/4a5VMBo",
        image: "https://m.media-amazon.com/images/I/71WIlpBAYeL._AC_SY355_.jpg",
        badge: "Oferta Limitada",
        badgeColor: "bg-red-500"
    },
    {
        id: 5,
        name: "Fone JBL sem Fio",
        description: "Fone de ouvido Bluetooth com som de alta qualidade, bateria de longa duração e design confortável.",
        link: "https://amzn.to/4aBFmRb",
        image: "https://m.media-amazon.com/images/I/51olNZRjn+L._AC_UL320_.jpg",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    },
    {
        id: 6,
        name: "Cartão de Memória SanDisk 128GB",
        description: "Micro SD de alta velocidade e armazenamento confiável. Ideal para celulares, câmeras e dispositivos portáteis.",
        link: "https://amzn.to/45OY7y4",
        image: "https://m.media-amazon.com/images/I/617NtexaW2L._AC_SY355_.jpg",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 7,
        name: "Câmera de Vigilância Interna",
        description: "Câmera Wi-Fi com visão 360°, resolução 2K e áudio bidirecional. Segurança inteligente para sua casa.",
        link: "https://amzn.to/4r4AkCC",
        image: "https://m.media-amazon.com/images/I/41WQe9NiU6L._AC_SY355_.jpg",
        badge: "Top Avaliado",
        badgeColor: "bg-blue-500"
    },
    {
        id: 8,
        name: "Cafeteira Elétrica Electrolux",
        description: "Cafeteira para até 30 xícaras, prática para o dia a dia. Perfeita para famílias e escritórios.",
        link: "https://amzn.to/4tpsWTW",
        image: "https://m.media-amazon.com/images/I/51OyvPACDML._AC_SY355_.jpg",
        badge: null,
        badgeColor: null
    },
    {
        id: 9,
        name: "Kit Cafeteira Nescafé Dolce Gusto",
        description: "Bebidas variadas em cápsulas: café, cappuccino, chocolate e muito mais com praticidade.",
        link: "https://amzn.to/4krHgYf",
        image: "https://m.media-amazon.com/images/I/51Zb0XNsXrL._AC_UL320_.jpg",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    },
    {
        id: 10,
        name: "Lápis Preto Faber-Castell",
        description: "Kit de lápis pretos de alta qualidade para escrita e desenho. Grafite macio e durável.",
        link: "https://amzn.to/46xjFzh",
        image: "https://m.media-amazon.com/images/I/51fvU1DCh3L._AC_UL320_.jpg",
        badge: null,
        badgeColor: null
    },
    {
        id: 11,
        name: "Lápis de Cor Faber-Castell",
        description: "Lápis de cor com pigmentos vibrantes e alta cobertura. Ideal para colorir e ilustrar.",
        link: "https://amzn.to/4tEcBLs",
        image: "https://m.media-amazon.com/images/I/61qCatoO2DL._AC_UL320_.jpg",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 12,
        name: "Caneta Esferográfica Faber-Castell",
        description: "Caneta com escrita macia e alta durabilidade. Kit com múltiplas unidades para uso diário.",
        link: "https://amzn.to/45Yl8i6",
        image: "https://m.media-amazon.com/images/I/51hgxzYdFJL._AC_UL320_.jpg",
        badge: null,
        badgeColor: null
    },
    {
        id: 13,
        name: "Kit Material Escolar",
        description: "Mochila e itens essenciais para estudantes. Tudo que você precisa para começar o ano letivo.",
        link: "https://amzn.to/4a3sD9U",
        image: "https://m.media-amazon.com/images/I/71mamCYoIaL._AC_SY355_.jpg",
        badge: "Volta às Aulas",
        badgeColor: "bg-cyan-500"
    },
    {
        id: 14,
        name: "Kit 15 Potes Herméticos",
        description: "Organização e vedação eficiente para sua cozinha. Mantém alimentos frescos por mais tempo.",
        link: "https://amzn.to/4tonMYh",
        image: "https://m.media-amazon.com/images/I/71GkZaavtPL._AC_SY355_.jpg",
        badge: "Oferta Limitada",
        badgeColor: "bg-red-500"
    },
    {
        id: 15,
        name: "Aspirador de Pó Vertical WAP",
        description: "Aspirador compacto, potente e prático. Limpeza silenciosa com alto poder de sucção.",
        link: "https://amzn.to/3LXAw7F",
        image: "https://m.media-amazon.com/images/I/61m5wUE9XzL._AC_UL320_.jpg",
        badge: "Top Avaliado",
        badgeColor: "bg-blue-500"
    },
    {
        id: 16,
        name: "Limpa Máquina de Lavar Roupas",
        description: "Limpador especializado para máquinas de lavar. Remove resíduos e elimina odores.",
        link: "https://amzn.to/4aDvlD2",
        image: "https://customer-assets.emergentagent.com/job_c4088a2f-8bb3-482b-bcd5-f2503c86c8d4/artifacts/ikadpjv2_17705860605473969020266149075844.jpg",
        badge: null,
        badgeColor: null
    },
    {
        id: 17,
        name: "Ventilador de Mesa WAP",
        description: "Ventilador potente, econômico e ideal para os dias quentes. Circulação de ar eficiente.",
        link: "https://amzn.to/45UX6o8",
        image: "https://m.media-amazon.com/images/I/61HaJHHFmsL._AC_SY355_.jpg",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    }
];

// Componente de imagem com proxy e fallback inteligente
const ProductImage = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        // Usar proxy para carregar a imagem
        const proxyUrl = getProxyImageUrl(src);
        setImgSrc(proxyUrl);
        setIsLoading(true);
        setHasError(false);
    }, [src]);
    
    const handleError = () => {
        // Se proxy falhar, tenta a URL direta
        if (imgSrc && imgSrc.includes('/api/proxy/')) {
            setImgSrc(src);
        } else {
            setHasError(true);
        }
        setIsLoading(false);
    };
    
    const handleLoad = () => {
        setIsLoading(false);
    };
    
    // Se houver erro, mostra placeholder com iniciais do produto
    if (hasError) {
        const initials = alt.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
                <span className="text-4xl font-bold text-orange-500">{initials}</span>
            </div>
        );
    }
    
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            {imgSrc && (
                <img 
                    src={imgSrc} 
                    alt={alt}
                    className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                    onError={handleError}
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
};

export default function AmazonOffersPage() {
    return (
        <>
            <Helmet>
                <title>Ofertas Amazon - Economizebem | Melhores Preços e Promoções</title>
                <meta name="description" content="Confira as melhores ofertas da Amazon selecionadas pelo Economizebem. Produtos com desconto, promoções exclusivas e economia garantida." />
                <meta name="keywords" content="ofertas amazon, promoções amazon, economizebem, comprar mais barato, desconto amazon, melhores preços" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 dark:from-amber-600 dark:via-orange-600 dark:to-amber-600 py-12">
                    <div className="container-main text-center text-white">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <ShoppingCart className="w-10 h-10" />
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Outfit']">
                                Ofertas Amazon
                            </h1>
                        </div>
                        <p className="text-lg md:text-xl text-amber-100 max-w-2xl mx-auto">
                            Produtos selecionados com os melhores preços. Economia garantida!
                        </p>
                        <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 fill-current" />
                                <span>Produtos Verificados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                <span>Melhores Preços</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                <span>Entrega Rápida</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="container-main py-12">
                    <div 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        data-testid="amazon-products-grid"
                    >
                        {amazonProducts.map((product) => (
                            <a
                                key={product.id}
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col relative"
                                data-testid={`amazon-product-${product.id}`}
                            >
                                {/* Badge */}
                                {product.badge && (
                                    <div className="absolute top-3 left-3 z-10">
                                        <Badge className={`${product.badgeColor} text-white text-xs px-2 py-1`}>
                                            {product.badge}
                                        </Badge>
                                    </div>
                                )}

                                {/* Image */}
                                <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
                                    <ProductImage 
                                        src={product.image}
                                        alt={product.name}
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                                        {product.description}
                                    </p>
                                    
                                    {/* CTA Button */}
                                    <Button 
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl h-11 font-semibold group-hover:shadow-lg transition-all"
                                        data-testid={`amazon-cta-${product.id}`}
                                    >
                                        Ver oferta na Amazon
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Preços e disponibilidade sujeitos a alteração. Última atualização: {new Date().toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Este site participa do Programa de Associados da Amazon, um programa de afiliados que permite ganhar comissões por indicação de produtos.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
