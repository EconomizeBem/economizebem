import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Tag, Clock, ChevronLeft, ChevronRight, Sofa } from 'lucide-react';
import { Button } from './ui/button';

// Configuração dos slides promocionais
const promoSlides = [
    {
        id: 'ferramentas',
        title: '🔥 30% OFF em Ferramentas',
        subtitle: 'Use o cupom ECOBEM30OFF em compras acima de R$100.',
        additionalText: 'Válido até 28/02 às 23:59.',
        couponCode: 'ECOBEM30OFF',
        endDate: new Date('2026-02-28T23:59:00-03:00'),
        buttonText: 'VER OFERTAS COM DESCONTO',
        affiliateLink: 'https://mercadolivre.com/sec/1yLAYaH',
        storeName: 'N2FERRAMENTAS',
        noticeText: 'Você será direcionado para nossa página no Mercado Livre. Clique em "Ir para o produto" e depois em "Vendido por N2FERRAMENTAS" para visualizar todos os produtos participantes da promoção e usar o mesmo cupom.',
    },
    {
        id: 'moveis',
        title: '🛋️ 5% OFF em Móveis Multimóveis',
        subtitle: 'Desconto válido para compras acima de R$800.',
        additionalText: 'Desconto máximo de R$100.',
        couponCode: null,
        endDate: new Date('2026-03-01T23:59:00-03:00'),
        buttonText: 'VER MÓVEIS COM DESCONTO',
        affiliateLink: 'https://mercadolivre.com/sec/2JUqfgw',
        storeName: 'MULTIMÓVEIS',
        noticeText: 'Você será direcionado para nossa página no Mercado Livre. Clique em "Ir para o produto" e depois em "Vendido por MULTIMÓVEIS" para visualizar todos os móveis participantes da promoção.',
    },
];

// Componente de Countdown
const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                expired: false,
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    return (
        <div className="flex items-center gap-1 md:gap-2" data-testid="countdown-timer">
            <div className="flex flex-col items-center bg-black text-[#FFE600] px-2 md:px-3 py-1 md:py-2 rounded-lg min-w-[45px] md:min-w-[60px] shadow-lg">
                <span className="text-lg md:text-2xl lg:text-3xl font-black">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wide">Dias</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-black">:</span>
            <div className="flex flex-col items-center bg-black text-[#FFE600] px-2 md:px-3 py-1 md:py-2 rounded-lg min-w-[45px] md:min-w-[60px] shadow-lg">
                <span className="text-lg md:text-2xl lg:text-3xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wide">Horas</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-black">:</span>
            <div className="flex flex-col items-center bg-black text-[#FFE600] px-2 md:px-3 py-1 md:py-2 rounded-lg min-w-[45px] md:min-w-[60px] shadow-lg">
                <span className="text-lg md:text-2xl lg:text-3xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wide">Min</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-black">:</span>
            <div className="flex flex-col items-center bg-black text-[#FFE600] px-2 md:px-3 py-1 md:py-2 rounded-lg min-w-[45px] md:min-w-[60px] shadow-lg">
                <span className="text-lg md:text-2xl lg:text-3xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wide">Seg</span>
            </div>
        </div>
    );
};

// Componente de Slide Individual
const PromoSlide = ({ slide }) => {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
                {/* Title */}
                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-black mb-2 font-['Outfit']">
                    {slide.title}
                </h2>
                
                {/* Subtitle with coupon */}
                <p className="text-sm md:text-base lg:text-lg text-black/80 mb-2 md:mb-3">
                    {slide.couponCode ? (
                        <>
                            Use o cupom{' '}
                            <span className="inline-flex items-center gap-1 bg-black text-[#FFE600] px-2 md:px-3 py-1 rounded-lg font-bold text-xs md:text-sm lg:text-base">
                                <Tag className="w-3 h-3 md:w-4 md:h-4" />
                                {slide.couponCode}
                            </span>{' '}
                            em compras acima de R$100.
                        </>
                    ) : (
                        slide.subtitle
                    )}
                </p>

                {/* Additional text */}
                <p className="text-xs md:text-sm text-black/70 flex items-center justify-center lg:justify-start gap-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    {slide.additionalText}
                </p>
            </div>

            {/* Right content - Countdown + Button */}
            <div className="flex flex-col items-center gap-3 md:gap-4">
                {/* Countdown */}
                <CountdownTimer endDate={slide.endDate} />

                {/* CTA Button */}
                <a
                    href={slide.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`promo-cta-${slide.id}`}
                >
                    <Button 
                        className="bg-black hover:bg-gray-900 text-white rounded-xl h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 hover:scale-105"
                    >
                        {slide.buttonText}
                        <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                </a>

                {/* Aviso informativo */}
                <p className="text-[10px] md:text-xs text-center max-w-xs md:max-w-sm" style={{ color: '#D32F2F' }}>
                    {slide.noticeText.split(slide.storeName).map((part, i, arr) => (
                        <span key={i}>
                            {part}
                            {i < arr.length - 1 && <strong>{slide.storeName}</strong>}
                        </span>
                    ))}
                </p>
            </div>
        </div>
    );
};

export const MercadoLivreBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Filtrar slides não expirados
    const activeSlides = promoSlides.filter(slide => {
        const now = new Date();
        return slide.endDate.getTime() > now.getTime();
    });

    const nextSlide = useCallback(() => {
        if (activeSlides.length > 1) {
            setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
        }
    }, [activeSlides.length]);

    const prevSlide = useCallback(() => {
        if (activeSlides.length > 1) {
            setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
        }
    }, [activeSlides.length]);

    // Auto-rotate every 5 seconds
    useEffect(() => {
        if (isPaused || activeSlides.length <= 1) return;
        
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide, activeSlides.length]);

    // Ajustar currentSlide se slides expirarem
    useEffect(() => {
        if (currentSlide >= activeSlides.length && activeSlides.length > 0) {
            setCurrentSlide(0);
        }
    }, [activeSlides.length, currentSlide]);

    // Se não houver slides ativos, não renderiza
    if (activeSlides.length === 0) return null;

    return (
        <section 
            className="py-4 md:py-6 relative overflow-hidden"
            style={{ backgroundColor: '#FFE600' }}
            data-testid="mercadolivre-promo-banner"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="container-main relative z-10">
                {/* Navigation arrows */}
                {activeSlides.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                            aria-label="Slide anterior"
                            data-testid="promo-carousel-prev"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                            aria-label="Próximo slide"
                            data-testid="promo-carousel-next"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-black" />
                        </button>
                    </>
                )}

                {/* Slides */}
                <div className="px-8 md:px-12">
                    <PromoSlide slide={activeSlides[currentSlide]} />
                </div>

                {/* Dot indicators */}
                {activeSlides.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4" data-testid="promo-carousel-dots">
                        {activeSlides.map((slide, idx) => (
                            <button
                                key={slide.id}
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${
                                    idx === currentSlide 
                                        ? 'bg-black w-5 md:w-6' 
                                        : 'bg-black/30 hover:bg-black/50'
                                }`}
                                aria-label={`Ir para slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default MercadoLivreBanner;
