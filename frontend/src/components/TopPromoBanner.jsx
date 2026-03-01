import { Link } from 'react-router-dom';
import { Trophy, ChevronRight } from 'lucide-react';

export const TopPromoBanner = () => {
    return (
        <Link 
            to="/promocoes-copa"
            className="block w-full bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 hover:from-green-700 hover:via-green-600 hover:to-yellow-600 transition-all duration-300"
            data-testid="top-promo-banner"
        >
            <div className="container-main py-2 md:py-2.5">
                <div className="flex items-center justify-center gap-2 md:gap-3 text-white">
                    <img src="/assets/copa-trophy.png" alt="Taça da Copa" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                    <span className="text-xs md:text-sm font-medium text-center">
                        Promoções para se preparar para a copa — clique e confira!
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors">
                        Ver ofertas
                        <ChevronRight className="w-3 h-3" />
                    </span>
                    <ChevronRight className="w-4 h-4 sm:hidden" />
                </div>
            </div>
        </Link>
    );
};

export default TopPromoBanner;
