import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function TermsPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-900/30">
            <div className="container-main max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/">
                        <Button variant="ghost" className="mb-4 -ml-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao início
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-sky-100 dark:bg-cyan-900/40 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Termos de Uso</h1>
                            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 space-y-8">
                    
                    <section>
                        <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Ao acessar e utilizar o site EconomizeBem ("Plataforma"), você concorda em cumprir e estar vinculado aos presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossa Plataforma. O uso continuado do site após quaisquer alterações nos Termos de Uso constitui aceitação dessas mudanças.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            O EconomizeBem é uma plataforma gratuita de comparação de preços que permite aos usuários:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Comparar preços de produtos em diversas lojas online do Brasil</li>
                            <li>Criar alertas de preço para serem notificados quando um produto atingir o valor desejado</li>
                            <li>Acessar ferramentas de organização financeira pessoal</li>
                            <li>Visualizar informações sobre planos de serviços (internet, telefonia, streaming)</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Os preços e informações exibidos são obtidos de fontes públicas e APIs de terceiros, podendo sofrer variações sem aviso prévio. O EconomizeBem não garante a precisão absoluta das informações exibidas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">3. Cadastro e Conta do Usuário</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Para utilizar determinadas funcionalidades da Plataforma, como alertas de preço e favoritos, é necessário criar uma conta. Ao se cadastrar, você concorda em:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Fornecer informações verdadeiras, precisas e completas</li>
                            <li>Manter suas informações de cadastro atualizadas</li>
                            <li>Manter a confidencialidade de sua senha e ser responsável por todas as atividades realizadas em sua conta</li>
                            <li>Notificar imediatamente o EconomizeBem sobre qualquer uso não autorizado de sua conta</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            O EconomizeBem reserva-se o direito de suspender ou encerrar contas que violem estes Termos de Uso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">4. Uso Aceitável</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Ao utilizar a Plataforma, você concorda em não:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Violar qualquer lei ou regulamento aplicável</li>
                            <li>Utilizar a Plataforma para fins ilegais ou não autorizados</li>
                            <li>Tentar acessar áreas restritas da Plataforma sem autorização</li>
                            <li>Interferir ou interromper o funcionamento da Plataforma ou servidores</li>
                            <li>Coletar informações de outros usuários sem consentimento</li>
                            <li>Utilizar robôs, scrapers ou outros métodos automatizados para acessar a Plataforma sem autorização prévia</li>
                            <li>Transmitir vírus, malware ou qualquer código malicioso</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">5. Propriedade Intelectual</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Todo o conteúdo da Plataforma, incluindo mas não limitado a textos, gráficos, logotipos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade do EconomizeBem ou de seus fornecedores de conteúdo e está protegido pelas leis brasileiras e internacionais de direitos autorais. A reprodução, distribuição ou modificação do conteúdo sem autorização prévia por escrito é estritamente proibida.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">6. Links para Sites de Terceiros</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Plataforma pode conter links para sites de terceiros (lojas online, marketplaces, etc.). Esses links são fornecidos apenas para conveniência do usuário. O EconomizeBem não tem controle sobre o conteúdo desses sites e não assume responsabilidade por quaisquer danos ou perdas decorrentes do uso desses sites. As transações realizadas em sites de terceiros são de responsabilidade exclusiva do usuário e do respectivo site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">7. Isenção de Garantias</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A Plataforma é fornecida "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas. O EconomizeBem não garante que: (a) a Plataforma atenderá às suas necessidades específicas; (b) a Plataforma será ininterrupta, oportuna, segura ou livre de erros; (c) os resultados obtidos pelo uso da Plataforma serão precisos ou confiáveis; (d) quaisquer erros na Plataforma serão corrigidos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Em nenhuma circunstância o EconomizeBem, seus diretores, funcionários, parceiros ou agentes serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de: (a) seu acesso ou uso ou incapacidade de acessar ou usar a Plataforma; (b) qualquer conduta ou conteúdo de terceiros na Plataforma; (c) qualquer conteúdo obtido da Plataforma; (d) acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">9. Modificações dos Termos</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            O EconomizeBem reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação na Plataforma. É responsabilidade do usuário revisar periodicamente os Termos de Uso. O uso continuado da Plataforma após a publicação de quaisquer alterações constitui aceitação dessas mudanças.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">10. Lei Aplicável e Foro</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Estes Termos de Uso serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Qualquer disputa decorrente destes termos será submetida à jurisdição exclusiva dos tribunais brasileiros, com foro na cidade de São Paulo, Estado de São Paulo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">11. Contato</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: <a href="mailto:contato@economizebem.com.br" className="text-sky-600 dark:text-cyan-400 hover:underline">contato@economizebem.com.br</a>
                        </p>
                    </section>

                </div>

                {/* Back to top */}
                <div className="mt-8 text-center">
                    <Link to="/">
                        <Button variant="outline" className="dark:border-slate-600">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar ao início
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
