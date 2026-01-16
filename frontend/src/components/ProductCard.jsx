import { Heart, ExternalLink, Star, Truck, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesApi, alertsApi } from '../lib/api';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export const ProductCard = ({ product, onFavoriteChange }) => {
    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState('');

    const bestStore = product.stores?.reduce((min, store) => 
        store.price < min.price ? store : min, product.stores[0]);
    
    const savings = bestStore?.original_price 
        ? ((bestStore.original_price - bestStore.price) / bestStore.original_price * 100).toFixed(0)
        : 0;

    // Obter URL da oferta (prioriza offer_url do produto, depois da loja)
    const getOfferUrl = () => {
        const url = product.offer_url || bestStore?.offer_url || bestStore?.url;
        // Validar que é uma URL válida
        if (url && url.startsWith('http')) {
            return url;
        }
        return null;
    };

    const handleViewOffer = () => {
        const offerUrl = getOfferUrl();
        
        if (offerUrl) {
            window.open(offerUrl, '_blank');
        } else {
            toast.error('Oferta indisponível no momento');
        }
    };

    const handleFavorite = async () => {
        if (!isAuthenticated) {
            toast.error('Faça login para favoritar produtos');
            return;
        }
        try {
            if (isFavorited) {
                await favoritesApi.remove('product', product.id);
                toast.success('Produto removido dos favoritos');
            } else {
                await favoritesApi.add('product', product.id, {
                    name: product.name,
                    image: product.image,
                    best_price: product.best_price
                });
                toast.success('Produto adicionado aos favoritos');
            }
            setIsFavorited(!isFavorited);
            onFavoriteChange?.();
        } catch (error) {
            toast.error('Erro ao atualizar favoritos');
        }
    };

    const handleCreateAlert = async () => {
        if (!targetPrice || parseFloat(targetPrice) <= 0) {
            toast.error('Informe um preço válido');
            return;
        }
        try {
            await alertsApi.create({
                product_id: product.id,
                product_name: product.name,
                product_image: product.image,
                target_price: parseFloat(targetPrice),
                current_price: product.best_price
            });
            toast.success('Alerta de preço criado com sucesso!');
            setAlertDialogOpen(false);
            setTargetPrice('');
        } catch (error) {
            toast.error('Erro ao criar alerta');
        }
    };

    return (
        <>
            <div className="product-card group" data-testid={`product-card-${product.id}`}>
                {/* Badge */}
                {savings > 10 && (
                    <div className="best-price-badge">
                        <TrendingDown className="w-3 h-3 inline mr-1" />
                        -{savings}%
                    </div>
                )}

                {/* Image */}
                <div className="aspect-square p-4 bg-slate-50 dark:bg-slate-800/50">
                    <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                    />
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <h3 className="font-semibold line-clamp-2 min-h-[48px]" data-testid="product-name">
                        {product.name}
                    </h3>

                    {/* Best Price */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-sky-600 dark:text-cyan-400" data-testid="product-price">
                            R$ {product.best_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {bestStore?.original_price > bestStore?.price && (
                            <span className="text-sm text-muted-foreground line-through">
                                R$ {bestStore.original_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>

                    {/* Best Store Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>{bestStore?.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            <span>{bestStore?.shipping === 0 ? 'Frete grátis' : (bestStore?.shipping ? `R$ ${bestStore.shipping}` : 'Consultar')}</span>
                        </div>
                        <span className="font-medium text-sky-600 dark:text-cyan-400">{bestStore?.store}</span>
                    </div>

                    {/* Store comparisons */}
                    <div className="space-y-2 pt-2 border-t dark:border-slate-700">
                        <p className="text-xs text-muted-foreground">Comparar em {product.stores?.length} lojas</p>
                        <div className="flex flex-wrap gap-1">
                            {product.stores?.slice(0, 4).map((store, idx) => (
                                <Badge 
                                    key={idx} 
                                    variant={store.price === product.best_price ? "default" : "secondary"}
                                    className={store.price === product.best_price ? "bg-sky-500 dark:bg-cyan-600" : "dark:bg-slate-700 dark:text-slate-300"}
                                >
                                    {store.store}: R$ {store.price?.toLocaleString('pt-BR')}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button 
                            className="flex-1 btn-primary rounded-xl"
                            onClick={handleViewOffer}
                            data-testid="buy-button"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Oferta
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={`rounded-xl border-2 transition-all ${isFavorited ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : 'hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20'}`}
                            onClick={handleFavorite}
                            data-testid="favorite-button"
                            aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-red-400'}`} />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl border-2 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            onClick={() => setAlertDialogOpen(true)}
                            data-testid="alert-button"
                            aria-label="Criar alerta de preço"
                            title="Criar alerta de preço"
                        >
                            <TrendingDown className="w-4 h-4 text-amber-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Alert Dialog */}
            <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Criar Alerta de Preço</DialogTitle>
                        <DialogDescription>
                            Você será notificado quando o preço atingir o valor desejado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-contain rounded" />
                            <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Preço atual: R$ {product.best_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="target-price">Preço desejado (R$)</Label>
                            <Input
                                id="target-price"
                                type="number"
                                step="0.01"
                                placeholder="Ex: 5999.00"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(e.target.value)}
                                data-testid="target-price-input"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button className="btn-primary" onClick={handleCreateAlert} data-testid="create-alert-btn">
                            Criar Alerta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
