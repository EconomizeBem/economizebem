import { Link } from 'react-router-dom';
import { Wallet, Mail } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" data-testid="footer">
            <div className="container-main py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-600 dark:from-cyan-600 dark:to-cyan-700 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl logo-text">
                                Economize<span className="text-sky-500 dark:text-cyan-400">Bem</span>
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
                            <li><Link to="/products" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Comparar Produtos</Link></li>
                            <li><Link to="/plans" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Comparar Planos</Link></li>
                            <li><Link to="/calculator" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Calculadora</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contato</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>contato@economizebem.com.br</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-8 border-slate-200 dark:border-slate-800" />

                {/* Amazon Affiliate Disclosure */}
                <p className="text-xs text-center text-muted-foreground mb-6 px-4">
                    Como participante do Programa de Associados da Amazon, o EconomizeBem pode receber comissões por compras qualificadas.
                </p>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 EconomizeBem. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Link to="/termos" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Termos de Uso</Link>
                        <Link to="/privacidade" className="hover:text-sky-500 dark:hover:text-cyan-400 transition-colors">Privacidade</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
