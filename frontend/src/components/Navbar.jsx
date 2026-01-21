import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
    Sun, 
    Moon, 
    Menu, 
    User, 
    LogOut, 
    Heart, 
    Bell, 
    Settings,
    Wallet,
    LayoutDashboard,
    ChevronDown,
    ChevronRight,
    Smartphone,
    Refrigerator,
    UtensilsCrossed,
    Shirt,
    Sparkles,
    PawPrint,
    ShoppingBag
} from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/products', label: 'Comparar Produtos' },
    { href: '/plans', label: 'Comparar Planos', comingSoon: true },
    { href: '/calculator', label: 'Calculadora' },
];

const categoryLinks = [
    { href: '/categoria/eletronicos', label: 'Eletrônicos', icon: Smartphone, description: 'Celulares, TVs, notebooks' },
    { href: '/categoria/eletrodomesticos', label: 'Eletrodomésticos', icon: Refrigerator, description: 'Geladeiras, máquinas de lavar' },
    { href: '/categoria/casa-cozinha', label: 'Casa & Cozinha', icon: UtensilsCrossed, description: 'Panelas, utensílios' },
    { href: '/categoria/vestuario', label: 'Vestuário', icon: Shirt, description: 'Roupas e calçados' },
    { href: '/categoria/beleza-saude', label: 'Beleza & Saúde', icon: Sparkles, description: 'Maquiagem, skincare' },
    { href: '/categoria/pets', label: 'Pets', icon: PawPrint, description: 'Ração, acessórios' },
];

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full glass-effect" data-testid="navbar">
            <nav className="container-main h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5" data-testid="logo-link">
                    <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-600 dark:from-cyan-600 dark:to-cyan-700 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25 dark:shadow-cyan-600/20">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl logo-text">
                        Economize<span className="text-sky-500 dark:text-cyan-400">Bem</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.slice(0, 2).map(link => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={`text-sm font-medium transition-colors hover:text-sky-500 dark:hover:text-cyan-400 flex items-center gap-1.5 ${
                                isActive(link.href) ? 'text-sky-500 dark:text-cyan-400 nav-link-active' : 'text-muted-foreground'
                            }`}
                            data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    {/* Categories Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button 
                                className={`text-sm font-medium transition-colors hover:text-sky-500 dark:hover:text-cyan-400 flex items-center gap-1 ${
                                    location.pathname.startsWith('/categoria') 
                                        ? 'text-sky-500 dark:text-cyan-400' 
                                        : 'text-muted-foreground'
                                }`}
                                data-testid="nav-categorias"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Categorias
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-64">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Explore por categoria
                            </DropdownMenuLabel>
                            {categoryLinks.map(cat => (
                                <DropdownMenuItem key={cat.href} onClick={() => navigate(cat.href)} className="cursor-pointer py-2.5">
                                    <cat.icon className="w-4 h-4 mr-3 text-sky-500 dark:text-cyan-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{cat.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground ml-2" />
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/products')} className="cursor-pointer">
                                <ShoppingBag className="w-4 h-4 mr-3" />
                                <span>Ver todos os produtos</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {navLinks.slice(2).map(link => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={`text-sm font-medium transition-colors hover:text-sky-500 dark:hover:text-cyan-400 flex items-center gap-1.5 ${
                                isActive(link.href) ? 'text-sky-500 dark:text-cyan-400 nav-link-active' : 'text-muted-foreground'
                            }`}
                            data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                        >
                            {link.label}
                            {link.comingSoon && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-1.5 py-0 h-4">
                                    Em breve
                                </Badge>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full"
                        data-testid="theme-toggle"
                    >
                        {theme === 'light' ? (
                            <Moon className="w-5 h-5" />
                        ) : (
                            <Sun className="w-5 h-5" />
                        )}
                    </Button>

                    {/* Auth Actions */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full" data-testid="user-menu-trigger">
                                    <User className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-3 py-2">
                                    <p className="font-semibold">{user?.name}</p>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Minha Conta
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/dashboard/favorites')} data-testid="menu-favorites">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Favoritos
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/dashboard/alerts')} data-testid="menu-alerts">
                                    <Bell className="w-4 h-4 mr-2" />
                                    Alertas de Preço
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} data-testid="menu-settings">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurações
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sair
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" onClick={() => navigate('/login')} data-testid="login-btn">
                                Entrar
                            </Button>
                            <Button 
                                className="rounded-full bg-sky-500 hover:bg-sky-600 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 dark:text-white dark:shadow-cyan-600/20" 
                                onClick={() => navigate('/register')} 
                                data-testid="register-btn"
                            >
                                Criar Conta
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-80">
                            <div className="flex flex-col gap-6 mt-8">
                                {navLinks.slice(0, 2).map(link => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`text-lg font-medium flex items-center gap-2 ${
                                            isActive(link.href) ? 'text-sky-500' : ''
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                
                                {/* Categories Section */}
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" />
                                        Categorias
                                    </p>
                                    <div className="pl-4 space-y-2.5 border-l-2 border-slate-200 dark:border-slate-700 max-h-[280px] overflow-y-auto">
                                        {categoryLinks.map(cat => (
                                            <Link
                                                key={cat.href}
                                                to={cat.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center gap-2 py-1 ${
                                                    location.pathname === cat.href ? 'text-sky-500 dark:text-cyan-400' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <cat.icon className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-sm">{cat.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                
                                {navLinks.slice(2).map(link => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`text-lg font-medium flex items-center gap-2 ${
                                            isActive(link.href) ? 'text-sky-500' : ''
                                        }`}
                                    >
                                        {link.label}
                                        {link.comingSoon && (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                                                Em breve
                                            </Badge>
                                        )}
                                    </Link>
                                ))}
                                <hr className="my-2" />
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-lg">
                                            Minha Conta
                                        </Link>
                                        <button onClick={handleLogout} className="text-lg text-red-600 text-left">
                                            Sair
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                                            Entrar
                                        </Button>
                                        <Button className="btn-primary" onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                                            Criar Conta
                                        </Button>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
};
