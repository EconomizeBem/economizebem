import { Helmet } from 'react-helmet';
import { ExternalLink, Star, Clock, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useState, useEffect } from 'react';

// URL base da API para proxy de imagens
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Função para gerar URL do proxy de imagem Amazon
const getAmazonImageProxy = (amazonImageUrl) => {
    return `${API_URL}/api/proxy/image?url=${encodeURIComponent(amazonImageUrl)}`;
};

// LISTA OFICIAL E FINAL DE PRODUTOS - Links EXATOS do usuário (imagem fornecida em 08/02/2026)
// Cada produto usa o link de afiliado exato fornecido pelo usuário
const amazonProducts = [
    {
        id: 1,
        name: "PlayStation 5",
        description: "Console de nova geração com gráficos impressionantes, SSD ultrarrápido e controle DualSense com feedback tátil.",
        link: "https://amzn.to/4r5pT1C",
        image: "https://m.media-amazon.com/images/I/71WCygaQDAL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
        badge: "Destaque",
        badgeColor: "bg-purple-500"
    },
    {
        id: 2,
        name: "Mala Upscape",
        description: "Mala de viagem resistente, leve e com rodas 360°. Ideal para viagens nacionais e internacionais.",
        link: "https://amzn.to/4kj5bCY",
        image: "https://m.media-amazon.com/images/I/71PwhBGpHIL._AC_SY500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400&h=400&fit=crop",
        badge: "Premium",
        badgeColor: "bg-slate-700"
    },
    {
        id: 3,
        name: "Poltrona Gamer",
        description: "Cadeira gamer ergonômica com ajuste de altura, apoio lombar e braços reguláveis. Conforto para longas sessões.",
        link: "https://amzn.to/4rAHHS9",
        image: "https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 4,
        name: "TV 50 Polegadas Aiwa",
        description: "Smart TV 4K com Android TV, HDR e Dolby Audio. Entretenimento completo com apps integrados.",
        link: "https://amzn.to/4a5VMBo",
        image: "https://m.media-amazon.com/images/I/71RiQZ29aAL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
        badge: "Oferta Limitada",
        badgeColor: "bg-red-500"
    },
    {
        id: 5,
        name: "Fone JBL sem Fio",
        description: "Fone de ouvido Bluetooth com som de alta qualidade, bateria de longa duração e design confortável.",
        link: "https://amzn.to/4aBFmRb",
        image: "https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    },
    {
        id: 6,
        name: "Cartão de Memória SanDisk 128GB",
        description: "Micro SD de alta velocidade e armazenamento confiável. Ideal para celulares, câmeras e dispositivos portáteis.",
        link: "https://amzn.to/45OY7y4",
        image: "https://m.media-amazon.com/images/I/617NtexaW2L._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1618152139319-f58e94b55a3a?w=400&h=400&fit=crop",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 7,
        name: "Câmera de Vigilância Interna",
        description: "Câmera Wi-Fi com visão 360°, resolução 2K e áudio bidirecional. Segurança inteligente para sua casa.",
        link: "https://amzn.to/4r4AkCC",
        image: "https://m.media-amazon.com/images/I/41m2+WiVLgL._AC_SL1000_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        badge: "Top Avaliado",
        badgeColor: "bg-blue-500"
    },
    {
        id: 8,
        name: "Cafeteira Elétrica Electrolux",
        description: "Cafeteira para até 30 xícaras, prática para o dia a dia. Perfeita para famílias e escritórios.",
        link: "https://amzn.to/4tpsWTW",
        image: "https://m.media-amazon.com/images/I/61pFT5V0iyL._AC_SL1200_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1565452344518-47faca79dc69?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxjb2ZmZWUlMjBtYWtlciUyMGVsZWN0cmljfGVufDB8fHx8MTc3MDU3ODA4Nnww&ixlib=rb-4.1.0&q=85",
        badge: null,
        badgeColor: null
    },
    {
        id: 9,
        name: "Kit Cafeteira Nescafé Dolce Gusto",
        description: "Bebidas variadas em cápsulas: café, cappuccino, chocolate e muito mais com praticidade.",
        link: "https://amzn.to/4krHgYf",
        image: "https://m.media-amazon.com/images/I/71LCd2rGdYL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    },
    {
        id: 10,
        name: "Lápis Preto Faber-Castell",
        description: "Kit de lápis pretos de alta qualidade para escrita e desenho. Grafite macio e durável.",
        link: "https://amzn.to/46xjFzh",
        image: "https://m.media-amazon.com/images/I/81yiOQf7oOL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1580570209561-3c60f64e7644?w=400&h=400&fit=crop",
        badge: null,
        badgeColor: null
    },
    {
        id: 11,
        name: "Lápis de Cor Faber-Castell",
        description: "Lápis de cor com pigmentos vibrantes e alta cobertura. Ideal para colorir e ilustrar.",
        link: "https://amzn.to/4tEcBLs",
        image: "https://m.media-amazon.com/images/I/81vpqWkm4QL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=400&h=400&fit=crop",
        badge: "Custo-Benefício",
        badgeColor: "bg-emerald-500"
    },
    {
        id: 12,
        name: "Caneta Esferográfica Faber-Castell",
        description: "Caneta com escrita macia e alta durabilidade. Kit com múltiplas unidades para uso diário.",
        link: "https://amzn.to/45Y18i6",
        image: "https://m.media-amazon.com/images/I/71+dIY+ooEL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop",
        badge: null,
        badgeColor: null
    },
    {
        id: 13,
        name: "Kit Material Escolar",
        description: "Mochila e itens essenciais para estudantes. Tudo que você precisa para começar o ano letivo.",
        link: "https://amzn.to/4a3sD9U",
        image: "https://m.media-amazon.com/images/I/91z+p9mGLlL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        badge: "Volta às Aulas",
        badgeColor: "bg-cyan-500"
    },
    {
        id: 14,
        name: "Kit 15 Potes Herméticos",
        description: "Organização e vedação eficiente para sua cozinha. Mantém alimentos frescos por mais tempo.",
        link: "https://amzn.to/4tonMYh",
        image: "https://m.media-amazon.com/images/I/71rZ3Gy6IRL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=400&h=400&fit=crop",
        badge: "Oferta Limitada",
        badgeColor: "bg-red-500"
    },
    {
        id: 15,
        name: "Aspirador de Pó Vertical WAP",
        description: "Aspirador compacto, potente e prático. Limpeza silenciosa com alto poder de sucção.",
        link: "https://amzn.to/3LXAw7F",
        image: "https://m.media-amazon.com/images/I/41UF8DQiYZL._AC_SL1000_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=400&fit=crop",
        badge: "Top Avaliado",
        badgeColor: "bg-blue-500"
    },
    {
        id: 16,
        name: "Limpa Máquina de Lavar Roupas",
        description: "Limpador especializado para máquinas de lavar. Remove resíduos e elimina odores.",
        link: "https://amzn.to/4aDv1D2",
        image: "https://m.media-amazon.com/images/I/71P4ew4L9bL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop",
        badge: null,
        badgeColor: null
    },
    {
        id: 17,
        name: "Ventilador de Mesa WAP",
        description: "Ventilador potente, econômico e ideal para os dias quentes. Circulação de ar eficiente.",
        link: "https://amzn.to/45UX6o8",
        image: "https://m.media-amazon.com/images/I/71Y1x6qEdrL._AC_SL1500_.jpg",
        fallbackImage: "https://images.unsplash.com/photo-1631368192614-50b81d0c3aba?w=400&h=400&fit=crop",
        badge: "Mais Vendido",
        badgeColor: "bg-amber-500"
    }
];

// Componente de imagem com fallback inteligente
const ProductImage = ({ src, fallback, alt }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorCount, setErrorCount] = useState(0);
    
    useEffect(() => {
        // Inicializa com a URL do proxy da Amazon
        setImgSrc(getAmazonImageProxy(src));
        setIsLoading(true);
        setErrorCount(0);
    }, [src]);
    
    const handleError = () => {
        if (errorCount === 0) {
            // Primeiro erro: tenta o fallback (Unsplash)
            setErrorCount(1);
            setImgSrc(fallback);
        } else {
            // Se o fallback também falhar, mostra placeholder com iniciais
            setErrorCount(2);
            const initials = alt.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f97316&color=fff&size=300&font-size=0.4&bold=true`);
        }
        setIsLoading(false);
    };
    
    const handleLoad = () => {
        setIsLoading(false);
    };
    
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
                                        fallback={product.fallbackImage}
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
