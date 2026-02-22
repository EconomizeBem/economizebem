import { useState, useEffect } from 'react';
import { ExternalLink, Tag, Clock } from 'lucide-react';
import { Button } from './ui/button';

const PROMO_END_DATE = new Date('2026-02-28T23:59:00-03:00'); // Horário de Brasília

export const MercadoLivreBanner = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = PROMO_END_DATE.getTime() - now.getTime();

            if (difference <= 0) {
                setIsExpired(true);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Não exibir se expirou
    if (isExpired) return null;

    const affiliateLink = 'https://lista.mercadolivre.com.br/pagina/n2ferramentas/lista/ferramentas/?tracking_id=97f2ddbd2339c8a7677e987a455a8833#client=HOME&component_id=menu_corridors&component=menu_corridors&label=Ferramentas&tracking_id=97f2ddbd2339c8a7677e987a455a8833&global_position=1';

    return (
        <section 
            className="py-6 relative overflow-hidden"
            style={{ backgroundColor: '#FFE600' }}
            data-testid="mercadolivre-promo-banner"
        >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="container-main relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Left content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Title */}
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-2 font-['Outfit']">
                            🔥 30% OFF em Ferramentas no Mercado Livre
                        </h2>
                        
                        {/* Subtitle */}
                        <p className="text-base md:text-lg text-black/80 mb-3">
                            Use o cupom exclusivo{' '}
                            <span className="inline-flex items-center gap-1 bg-black text-[#FFE600] px-3 py-1 rounded-lg font-bold text-sm md:text-base">
                                <Tag className="w-4 h-4" />
                                ECOBEM30OFF
                            </span>{' '}
                            e ganhe 30% de desconto em compras acima de R$100.
                        </p>

                        {/* Additional text */}
                        <p className="text-sm text-black/70 flex items-center justify-center lg:justify-start gap-1">
                            <Clock className="w-4 h-4" />
                            Oferta válida até 28 de fevereiro às 23:59. Aproveite antes que expire!
                        </p>
                    </div>

                    {/* Right content - Countdown + Button */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Countdown */}
                        <div className="flex items-center gap-2 md:gap-3" data-testid="countdown-timer">
                            <div className="flex flex-col items-center bg-black text-[#FFE600] px-3 py-2 rounded-lg min-w-[60px] shadow-lg">
                                <span className="text-2xl md:text-3xl font-black">{String(timeLeft.days).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wide">Dias</span>
                            </div>
                            <span className="text-2xl font-bold text-black">:</span>
                            <div className="flex flex-col items-center bg-black text-[#FFE600] px-3 py-2 rounded-lg min-w-[60px] shadow-lg">
                                <span className="text-2xl md:text-3xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wide">Horas</span>
                            </div>
                            <span className="text-2xl font-bold text-black">:</span>
                            <div className="flex flex-col items-center bg-black text-[#FFE600] px-3 py-2 rounded-lg min-w-[60px] shadow-lg">
                                <span className="text-2xl md:text-3xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wide">Min</span>
                            </div>
                            <span className="text-2xl font-bold text-black">:</span>
                            <div className="flex flex-col items-center bg-black text-[#FFE600] px-3 py-2 rounded-lg min-w-[60px] shadow-lg">
                                <span className="text-2xl md:text-3xl font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wide">Seg</span>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <a
                            href={affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="mercadolivre-cta"
                        >
                            <Button 
                                className="bg-black hover:bg-gray-900 text-white rounded-xl h-14 px-8 text-lg font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 hover:scale-105"
                            >
                                VER OFERTAS COM DESCONTO
                                <ExternalLink className="w-5 h-5" />
                            </Button>
                        </a>

                        {/* Aviso informativo */}
                        <p className="text-xs md:text-sm text-center max-w-sm" style={{ color: '#D32F2F' }}>
                            Você será direcionado para um produto da loja.<br />
                            Dentro da página, clique no nome da loja <strong>N2FERRAMENTAS</strong> para ver todos os produtos participantes da promoção.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MercadoLivreBanner;
