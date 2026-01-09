import { Heart, Check, Star, Zap, Wifi, Smartphone, Tv } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesApi } from '../lib/api';
import { toast } from 'sonner';

const getPlanIcon = (type) => {
    switch(type) {
        case 'internet': return <Wifi className="w-5 h-5" />;
        case 'mobile': return <Smartphone className="w-5 h-5" />;
        case 'streaming': return <Tv className="w-5 h-5" />;
        default: return <Zap className="w-5 h-5" />;
    }
};

export const PlanCard = ({ plan, type, onFavoriteChange }) => {
    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            toast.error('Faça login para favoritar planos');
            return;
        }
        try {
            if (isFavorited) {
                await favoritesApi.remove('plan', plan.id);
                toast.success('Plano removido dos favoritos');
            } else {
                await favoritesApi.add('plan', plan.id, {
                    provider: plan.provider,
                    name: plan.name,
                    price: plan.price,
                    type: type
                });
                toast.success('Plano adicionado aos favoritos');
            }
            setIsFavorited(!isFavorited);
            onFavoriteChange?.();
        } catch (error) {
            toast.error('Erro ao atualizar favoritos');
        }
    };

    const getMainMetric = () => {
        if (type === 'internet') return `${plan.speed} Mega`;
        if (type === 'mobile') return `${plan.data_gb} GB`;
        if (type === 'streaming') return `${plan.screens} tela${plan.screens > 1 ? 's' : ''}`;
        return '';
    };

    return (
        <div 
            className={`flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                    ? 'border-emerald-500 plan-card-popular' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50'
            }`}
            data-testid={`plan-card-${plan.id}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.popular ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                        {getPlanIcon(type)}
                    </div>
                    <div>
                        <h3 className="font-semibold">{plan.provider}</h3>
                        <p className="text-sm text-muted-foreground">{plan.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-sm font-medium">{plan.rating}</span>
                </div>
            </div>

            {/* Main Metric */}
            <div className="text-center py-6 border-y border-dashed">
                <div className="text-4xl font-bold text-emerald-600 mb-1">
                    {getMainMetric()}
                </div>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">R$ {plan.price?.toFixed(2).replace('.', ',')}</span>
                    <span className="text-muted-foreground">/mês</span>
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 py-6 flex-1">
                {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
                {plan.loyalty_months > 0 && (
                    <li className="flex items-center gap-2 text-sm text-amber-600">
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                            {plan.loyalty_months} meses de fidelidade
                        </Badge>
                    </li>
                )}
                {plan.loyalty_months === 0 && (
                    <li className="flex items-center gap-2 text-sm text-emerald-600">
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                            Sem fidelidade
                        </Badge>
                    </li>
                )}
            </ul>

            {/* Actions */}
            <div className="flex gap-2">
                <Button 
                    className={`flex-1 rounded-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    data-testid="contract-button"
                >
                    Contratar
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={handleFavorite}
                    data-testid="favorite-plan-button"
                >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
            </div>
        </div>
    );
};
