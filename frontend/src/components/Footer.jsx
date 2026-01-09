import { Link } from 'react-router-dom';
import { TrendingUp, Mail, Github, Linkedin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="border-t bg-zinc-50 dark:bg-zinc-950" data-testid="footer">
            <div className="container-main py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold font-['Manrope']">
                                Economiza<span className="text-emerald-600">í</span>
                            </span>
                        </div>
                        <p className="text-muted-foreground max-w-sm">
                            Ajudamos você a gastar menos e decidir melhor. Compare preços, analise planos e organize suas finanças.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Navegação</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link to="/products" className="hover:text-emerald-600 transition-colors">Comparar Produtos</Link></li>
                            <li><Link to="/plans" className="hover:text-emerald-600 transition-colors">Comparar Planos</Link></li>
                            <li><Link to="/calculator" className="hover:text-emerald-600 transition-colors">Calculadora</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contato</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>contato@economizai.com.br</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 Economizaí. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Link to="#" className="hover:text-emerald-600 transition-colors">Termos de Uso</Link>
                        <Link to="#" className="hover:text-emerald-600 transition-colors">Privacidade</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
