import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { 
    LayoutDashboard, 
    Heart, 
    Bell, 
    Settings, 
    User, 
    LogOut,
    Package,
    Wifi,
    Trash2,
    Edit,
    TrendingUp,
    ChevronRight
} from 'lucide-react';
import { favoritesApi, alertsApi } from '../lib/api';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';

const sidebarLinks = [
    { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/dashboard/favorites', label: 'Favoritos', icon: Heart },
    { href: '/dashboard/alerts', label: 'Alertas de Preço', icon: Bell },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export default function DashboardLayout() {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [loading, isAuthenticated, navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen py-8" data-testid="dashboard-layout">
            <div className="container-main">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-4">
                                {/* User Info */}
                                <div className="flex items-center gap-3 p-4 mb-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <User className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{user?.name}</p>
                                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>

                                {/* Nav Links */}
                                <nav className="space-y-1">
                                    {sidebarLinks.map(link => {
                                        const isActive = location.pathname === link.href;
                                        return (
                                            <Link
                                                key={link.href}
                                                to={link.href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                    isActive 
                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                                                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                                }`}
                                            >
                                                <link.icon className="w-5 h-5" />
                                                <span>{link.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export function DashboardOverview() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ favorites: 0, alerts: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [favRes, alertsRes] = await Promise.all([
                favoritesApi.getAll(),
                alertsApi.getAll()
            ]);
            const favs = favRes.data;
            setStats({
                favorites: (favs.products?.length || 0) + (favs.plans?.length || 0),
                alerts: alertsRes.data?.length || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    return (
        <div className="space-y-8" data-testid="dashboard-overview">
            <div>
                <h1 className="text-2xl font-bold mb-2">Olá, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Bem-vindo à sua área de economia</p>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.favorites}</p>
                                <p className="text-sm text-muted-foreground">Favoritos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.alerts}</p>
                                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">R$ 0</p>
                                <p className="text-sm text-muted-foreground">Economizado</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link to="/products">
                            <Button variant="outline" className="w-full justify-between h-14">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5" />
                                    <span>Comparar Produtos</span>
                                </div>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/plans">
                            <Button variant="outline" className="w-full justify-between h-14">
                                <div className="flex items-center gap-3">
                                    <Wifi className="w-5 h-5" />
                                    <span>Comparar Planos</span>
                                </div>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function DashboardFavorites() {
    const [favorites, setFavorites] = useState({ products: [], plans: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await favoritesApi.getAll();
            setFavorites(response.data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (type, itemId) => {
        try {
            await favoritesApi.remove(type, itemId);
            toast.success('Favorito removido');
            fetchFavorites();
        } catch (error) {
            toast.error('Erro ao remover favorito');
        }
    };

    const hasItems = favorites.products?.length > 0 || favorites.plans?.length > 0;

    return (
        <div className="space-y-8" data-testid="dashboard-favorites">
            <div>
                <h1 className="text-2xl font-bold mb-2">Meus Favoritos</h1>
                <p className="text-muted-foreground">Produtos e planos que você salvou</p>
            </div>

            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : !hasItems ? (
                <EmptyState 
                    type="favorites" 
                    action={
                        <Link to="/products">
                            <Button className="btn-primary">Explorar Produtos</Button>
                        </Link>
                    }
                />
            ) : (
                <>
                    {/* Products */}
                    {favorites.products?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Produtos ({favorites.products.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {favorites.products.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-16 h-16 object-contain rounded"
                                                />
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-emerald-600 font-semibold">
                                                        R$ {item.best_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => handleRemove('product', item.item_id)}
                                                className="text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Plans */}
                    {favorites.plans?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wifi className="w-5 h-5" />
                                    Planos ({favorites.plans.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {favorites.plans.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                                            <div>
                                                <p className="font-medium">{item.provider} - {item.name}</p>
                                                <p className="text-emerald-600 font-semibold">
                                                    R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                                                </p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => handleRemove('plan', item.item_id)}
                                                className="text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export function DashboardAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await alertsApi.getAll();
            setAlerts(response.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (alert) => {
        try {
            await alertsApi.update(alert.id, { is_active: !alert.is_active });
            toast.success(alert.is_active ? 'Alerta desativado' : 'Alerta ativado');
            fetchAlerts();
        } catch (error) {
            toast.error('Erro ao atualizar alerta');
        }
    };

    const handleDelete = async (id) => {
        try {
            await alertsApi.delete(id);
            toast.success('Alerta removido');
            fetchAlerts();
        } catch (error) {
            toast.error('Erro ao remover alerta');
        }
    };

    return (
        <div className="space-y-8" data-testid="dashboard-alerts">
            <div>
                <h1 className="text-2xl font-bold mb-2">Alertas de Preço</h1>
                <p className="text-muted-foreground">Receba notificações quando os preços baixarem</p>
            </div>

            {loading ? (
                <div className="text-center py-12">Carregando...</div>
            ) : alerts.length === 0 ? (
                <EmptyState 
                    type="alerts" 
                    action={
                        <Link to="/products">
                            <Button className="btn-primary">Criar Alerta</Button>
                        </Link>
                    }
                />
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {alerts.map(alert => (
                                <div 
                                    key={alert.id} 
                                    className={`p-4 flex items-center justify-between ${!alert.is_active ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={alert.product_image} 
                                            alt={alert.product_name} 
                                            className="w-16 h-16 object-contain rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{alert.product_name}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-muted-foreground">
                                                    Atual: R$ {alert.current_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-emerald-600 font-semibold">
                                                    Meta: R$ {alert.target_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch 
                                            checked={alert.is_active} 
                                            onCheckedChange={() => handleToggle(alert)}
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => handleDelete(alert.id)}
                                            className="text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export function DashboardSettings() {
    const { user, updateProfile, changePassword, logout } = useAuth();
    const navigate = useNavigate();
    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState({ profile: false, password: false });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading({ ...loading, profile: true });
        try {
            await updateProfile(profileForm);
            toast.success('Perfil atualizado com sucesso');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao atualizar perfil');
        } finally {
            setLoading({ ...loading, profile: false });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error('As senhas não coincidem');
            return;
        }
        if (passwordForm.new.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }
        setLoading({ ...loading, password: true });
        try {
            await changePassword(passwordForm.current, passwordForm.new);
            toast.success('Senha alterada com sucesso');
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Erro ao alterar senha');
        } finally {
            setLoading({ ...loading, password: false });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="space-y-8" data-testid="dashboard-settings">
            <div>
                <h1 className="text-2xl font-bold mb-2">Configurações</h1>
                <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                    <CardDescription>Atualize suas informações de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome</Label>
                                <Input
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    data-testid="profile-name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-mail</Label>
                                <Input
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    data-testid="profile-email-input"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="btn-primary" disabled={loading.profile} data-testid="save-profile-btn">
                            {loading.profile ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Password Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>Mantenha sua conta segura</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Senha Atual</Label>
                            <Input
                                type="password"
                                value={passwordForm.current}
                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                data-testid="current-password-input"
                            />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nova Senha</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    data-testid="new-password-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirmar Nova Senha</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    data-testid="confirm-new-password-input"
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="outline" disabled={loading.password} data-testid="change-password-btn">
                            {loading.password ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={handleLogout} data-testid="logout-btn">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da Conta
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
