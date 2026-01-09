import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/products', label: 'Comparar Produtos' },
    { href: '/plans', label: 'Comparar Planos' },
    { href: '/calculator', label: 'Calculadora' },
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
                <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold font-['Manrope']">
                        Economiza<span className="text-emerald-600">í</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                                isActive(link.href) ? 'text-emerald-600 nav-link-active' : 'text-muted-foreground'
                            }`}
                            data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                        >
                            {link.label}
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
                            <Button className="btn-primary rounded-full" onClick={() => navigate('/register')} data-testid="register-btn">
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
                                {navLinks.map(link => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`text-lg font-medium ${
                                            isActive(link.href) ? 'text-emerald-600' : ''
                                        }`}
                                    >
                                        {link.label}
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
