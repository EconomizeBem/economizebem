import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Wifi, Smartphone, Tv } from 'lucide-react';
import { PlanCard } from '../components/PlanCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { plansApi } from '../lib/api';

export default function PlansPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'internet');
    const [plans, setPlans] = useState({ internet: [], mobile: [], streaming: [] });
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [maxPrice, setMaxPrice] = useState(200);
    const [minSpeed, setMinSpeed] = useState(0);
    const [minData, setMinData] = useState(0);
    const [minScreens, setMinScreens] = useState(1);
    const [noLoyalty, setNoLoyalty] = useState(false);

    useEffect(() => {
        fetchAllPlans();
    }, []);

    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab]);

    const fetchAllPlans = async () => {
        setLoading(true);
        try {
            const [internetRes, mobileRes, streamingRes] = await Promise.all([
                plansApi.getInternet(),
                plansApi.getMobile(),
                plansApi.getStreaming()
            ]);
            setPlans({
                internet: internetRes.data,
                mobile: mobileRes.data,
                streaming: streamingRes.data
            });
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPlans = (planList, type) => {
        return planList.filter(plan => {
            if (plan.price > maxPrice) return false;
            if (noLoyalty && plan.loyalty_months > 0) return false;
            
            if (type === 'internet' && minSpeed > 0 && plan.speed < minSpeed) return false;
            if (type === 'mobile' && minData > 0 && plan.data_gb < minData) return false;
            if (type === 'streaming' && plan.screens < minScreens) return false;
            
            return true;
        });
    };

    const filteredInternet = filterPlans(plans.internet, 'internet');
    const filteredMobile = filterPlans(plans.mobile, 'mobile');
    const filteredStreaming = filterPlans(plans.streaming, 'streaming');

    return (
        <div className="min-h-screen py-8" data-testid="plans-page">
            <div className="container-main">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Manrope']">
                        Comparar Planos
                    </h1>
                    <p className="text-muted-foreground">
                        Encontre o melhor plano de internet, celular ou streaming
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="p-6 rounded-xl border bg-card">
                            <h3 className="font-semibold mb-4">Filtros</h3>
                            
                            {/* Price Filter */}
                            <div className="space-y-3 mb-6">
                                <Label>Preço máximo: R$ {maxPrice}</Label>
                                <Slider
                                    value={[maxPrice]}
                                    onValueChange={(v) => setMaxPrice(v[0])}
                                    max={300}
                                    min={10}
                                    step={10}
                                    className="w-full"
                                    data-testid="price-slider"
                                />
                            </div>

                            {/* Conditional Filters */}
                            {activeTab === 'internet' && (
                                <div className="space-y-3 mb-6">
                                    <Label>Velocidade mínima: {minSpeed} Mega</Label>
                                    <Slider
                                        value={[minSpeed]}
                                        onValueChange={(v) => setMinSpeed(v[0])}
                                        max={600}
                                        min={0}
                                        step={50}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {activeTab === 'mobile' && (
                                <div className="space-y-3 mb-6">
                                    <Label>Dados mínimos: {minData} GB</Label>
                                    <Slider
                                        value={[minData]}
                                        onValueChange={(v) => setMinData(v[0])}
                                        max={50}
                                        min={0}
                                        step={5}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {activeTab === 'streaming' && (
                                <div className="space-y-3 mb-6">
                                    <Label>Telas mínimas: {minScreens}</Label>
                                    <Slider
                                        value={[minScreens]}
                                        onValueChange={(v) => setMinScreens(v[0])}
                                        max={4}
                                        min={1}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* No Loyalty Filter */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="no-loyalty">Sem fidelidade</Label>
                                <Switch
                                    id="no-loyalty"
                                    checked={noLoyalty}
                                    onCheckedChange={setNoLoyalty}
                                    data-testid="no-loyalty-switch"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-3 mb-8 h-14">
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

                            {/* Internet Plans */}
                            <TabsContent value="internet">
                                {loading ? (
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <LoadingSkeleton type="plan" count={3} />
                                    </div>
                                ) : filteredInternet.length === 0 ? (
                                    <EmptyState type="plans" />
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {filteredInternet.length} plano{filteredInternet.length !== 1 ? 's' : ''} encontrado{filteredInternet.length !== 1 ? 's' : ''}
                                        </p>
                                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="internet-plans-grid">
                                            {filteredInternet.map(plan => (
                                                <PlanCard key={plan.id} plan={plan} type="internet" />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            {/* Mobile Plans */}
                            <TabsContent value="mobile">
                                {loading ? (
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <LoadingSkeleton type="plan" count={3} />
                                    </div>
                                ) : filteredMobile.length === 0 ? (
                                    <EmptyState type="plans" />
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {filteredMobile.length} plano{filteredMobile.length !== 1 ? 's' : ''} encontrado{filteredMobile.length !== 1 ? 's' : ''}
                                        </p>
                                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="mobile-plans-grid">
                                            {filteredMobile.map(plan => (
                                                <PlanCard key={plan.id} plan={plan} type="mobile" />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </TabsContent>

                            {/* Streaming Plans */}
                            <TabsContent value="streaming">
                                {loading ? (
                                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <LoadingSkeleton type="plan" count={3} />
                                    </div>
                                ) : filteredStreaming.length === 0 ? (
                                    <EmptyState type="plans" />
                                ) : (
                                    <>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {filteredStreaming.length} plano{filteredStreaming.length !== 1 ? 's' : ''} encontrado{filteredStreaming.length !== 1 ? 's' : ''}
                                        </p>
                                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="streaming-plans-grid">
                                            {filteredStreaming.map(plan => (
                                                <PlanCard key={plan.id} plan={plan} type="streaming" />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </div>
    );
}
