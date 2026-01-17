import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PrivacyPage() {
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
                            <Shield className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Política de Privacidade</h1>
                            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 space-y-8">
                    
                    <section>
                        <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            O EconomizeBem ("nós", "nosso" ou "Plataforma") está comprometido em proteger a privacidade dos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de comparação de preços. Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">2. Informações que Coletamos</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
                        </p>
                        
                        <h3 className="text-lg font-medium mb-2 mt-4">2.1. Informações fornecidas pelo usuário</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>Dados de cadastro:</strong> nome, endereço de e-mail e senha ao criar uma conta</li>
                            <li><strong>Preferências:</strong> alertas de preço, produtos favoritos e configurações de notificação</li>
                            <li><strong>Comunicações:</strong> mensagens enviadas através de nossos canais de suporte</li>
                        </ul>

                        <h3 className="text-lg font-medium mb-2 mt-4">2.2. Informações coletadas automaticamente</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>Dados de uso:</strong> páginas visitadas, produtos pesquisados, tempo de permanência</li>
                            <li><strong>Informações do dispositivo:</strong> tipo de navegador, sistema operacional, endereço IP</li>
                            <li><strong>Cookies e tecnologias similares:</strong> para melhorar a experiência de navegação</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">3. Como Usamos suas Informações</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Utilizamos as informações coletadas para:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Fornecer, manter e melhorar nossos serviços de comparação de preços</li>
                            <li>Enviar alertas de preço e notificações solicitadas pelo usuário</li>
                            <li>Personalizar sua experiência na plataforma</li>
                            <li>Processar e gerenciar sua conta</li>
                            <li>Comunicar atualizações importantes sobre o serviço</li>
                            <li>Analisar tendências de uso para melhorar a plataforma</li>
                            <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                            <li>Cumprir obrigações legais e regulatórias</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Não vendemos suas informações pessoais. Podemos compartilhar suas informações nas seguintes circunstâncias:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>Prestadores de serviço:</strong> empresas que nos auxiliam na operação da plataforma (hospedagem, e-mail, análise de dados)</li>
                            <li><strong>Parceiros de publicidade:</strong> para exibição de anúncios relevantes (como Google AdSense), respeitando as preferências do usuário</li>
                            <li><strong>Requisitos legais:</strong> quando necessário para cumprir leis, regulamentos ou processos legais</li>
                            <li><strong>Proteção de direitos:</strong> para proteger os direitos, propriedade ou segurança do EconomizeBem e seus usuários</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">5. Cookies e Tecnologias de Rastreamento</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Utilizamos cookies e tecnologias similares para:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Manter você conectado à sua conta</li>
                            <li>Lembrar suas preferências de navegação</li>
                            <li>Analisar o tráfego e uso da plataforma</li>
                            <li>Exibir anúncios personalizados</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades da plataforma. Para mais informações sobre como gerenciar cookies, consulte as configurações do seu navegador.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">6. Publicidade e Google AdSense</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Utilizamos o Google AdSense para exibir anúncios em nossa plataforma. O Google pode usar cookies para exibir anúncios com base em visitas anteriores ao nosso site ou a outros sites na internet. Você pode desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-cyan-400 hover:underline">Configurações de Anúncios do Google</a>. Para mais informações sobre como o Google usa dados de publicidade, consulte a <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-cyan-400 hover:underline">Política de Publicidade do Google</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">7. Segurança dos Dados</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia de dados sensíveis, controle de acesso restrito e monitoramento contínuo de nossos sistemas. No entanto, nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro, e não podemos garantir segurança absoluta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">8. Retenção de Dados</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Mantemos suas informações pessoais pelo tempo necessário para fornecer nossos serviços e cumprir as finalidades descritas nesta política. Quando você solicitar a exclusão de sua conta, removeremos seus dados pessoais em até 30 dias, exceto quando houver obrigação legal de retenção ou necessidade de resolução de disputas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">9. Seus Direitos (LGPD)</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            De acordo com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem os seguintes direitos:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessá-los</li>
                            <li><strong>Correção:</strong> solicitar a correção de dados incompletos ou desatualizados</li>
                            <li><strong>Anonimização ou eliminação:</strong> solicitar a anonimização ou exclusão de dados desnecessários</li>
                            <li><strong>Portabilidade:</strong> solicitar a transferência de seus dados para outro fornecedor</li>
                            <li><strong>Revogação do consentimento:</strong> retirar o consentimento a qualquer momento</li>
                            <li><strong>Oposição:</strong> opor-se ao tratamento de dados em determinadas circunstâncias</li>
                        </ul>
                        <p className="text-muted-foreground leading-relaxed mt-4">
                            Para exercer esses direitos, entre em contato conosco através do e-mail indicado na seção de Contato.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">10. Proteção de Menores</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações pessoais de menores. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco para que possamos tomar as medidas necessárias.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">11. Links para Sites de Terceiros</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Nossa plataforma contém links para sites de terceiros (lojas online). Esta Política de Privacidade aplica-se apenas ao EconomizeBem. Recomendamos que você leia as políticas de privacidade de cada site que visitar, pois não temos controle sobre as práticas de privacidade de terceiros.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">12. Alterações nesta Política</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios. Notificaremos você sobre alterações significativas por e-mail ou através de um aviso em nossa plataforma. Recomendamos revisar esta política regularmente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">13. Contato</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Se você tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade ou ao tratamento de seus dados pessoais, entre em contato conosco:
                        </p>
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-muted-foreground">
                                <strong>E-mail:</strong> <a href="mailto:contato@economizebem.com.br" className="text-sky-600 dark:text-cyan-400 hover:underline">contato@economizebem.com.br</a>
                            </p>
                            <p className="text-muted-foreground mt-2">
                                <strong>Encarregado de Proteção de Dados (DPO):</strong> <a href="mailto:privacidade@economizebem.com.br" className="text-sky-600 dark:text-cyan-400 hover:underline">privacidade@economizebem.com.br</a>
                            </p>
                        </div>
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
