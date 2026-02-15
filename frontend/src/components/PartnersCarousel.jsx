import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Flame } from 'lucide-react';
import { Button } from './ui/button';

const partners = [
    {
        id: 'arno',
        name: 'Arno',
        description: 'Até 45% OFF em eletroportáteis e produtos para casa',
        logo: '/partners/arno-logo.svg',
        link: 'https://www.awin1.com/cread.php?awinmid=108626&awinaffid=2764132&ued=https%3A%2F%2Fwww.arno.com.br%2Farno%2Fofertas-arno',
        bgGradient: 'from-red-600 to-red-800',
    },
    {
        id: 'nike',
        name: 'Nike',
        description: 'Ofertas em tênis, roupas e acessórios esportivos',
        logo: '/partners/nike-logo.svg',
        link: 'https://www.awin1.com/cread.php?awinmid=17652&awinaffid=2764132&ued=https%3A%2F%2Fwww.nike.com.br%2Fnav%2Fofertas%2Femoferta',
        bgGradient: 'from-gray-800 to-black',
    },
];

export const PartnersCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length);
    }, []);

    useEffect(() => {
        if (isPaused || partners.length <= 1) return;
        
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const currentPartner = partners[currentIndex];

    return (
        <section 
            className="py-10 bg-slate-50 dark:bg-slate-900/50" 
            data-testid="partners-carousel-section"
        >
            <div className="container-main">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl md:text-3xl font-bold font-['Outfit']">
                            Ofertas nas Melhores Lojas
                        </h2>
                    </div>
                    <p className="text-muted-foreground">
                        Economize nas maiores marcas do Brasil
                    </p>
                </div>

                {/* Carousel */}
                <div 
                    className="relative max-w-4xl mx-auto"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Navigation Arrows */}
                    {partners.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                                aria-label="Anterior"
                                data-testid="carousel-prev"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                                aria-label="Próximo"
                                data-testid="carousel-next"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                        </>
                    )}

                    {/* Partner Card */}
                    <div 
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
                        data-testid={`partner-card-${currentPartner.id}`}
                    >
                        <div className="flex flex-col md:flex-row items-center">
                            {/* Logo Section */}
                            <div className="w-full md:w-1/3 p-8 flex items-center justify-center bg-white">
                                <img
                                    src={currentPartner.logo}
                                    alt={`Logo ${currentPartner.name}`}
                                    className="max-h-24 md:max-h-32 w-auto object-contain"
                                    data-testid={`partner-logo-${currentPartner.id}`}
                                />
                            </div>

                            {/* Content Section */}
                            <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col items-center md:items-start text-center md:text-left">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    {currentPartner.name}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 text-base md:text-lg">
                                    {currentPartner.description}
                                </p>
                                <a
                                    href={currentPartner.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`partner-cta-${currentPartner.id}`}
                                >
                                    <Button 
                                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        Ver ofertas
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Dots Indicator */}
                    {partners.length > 1 && (
                        <div className="flex justify-center gap-2 mt-6" data-testid="carousel-dots">
                            {partners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                                        idx === currentIndex 
                                            ? 'bg-orange-500 w-6' 
                                            : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                                    }`}
                                    aria-label={`Ir para slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PartnersCarousel;
