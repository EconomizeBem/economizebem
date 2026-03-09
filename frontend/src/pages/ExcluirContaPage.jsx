import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { AlertTriangle, CheckCircle2, Loader2, Mail } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || '';

export default function ExcluirContaPage() {
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/account/delete-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, reason }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || 'Erro ao enviar solicitação');
            }

            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Erro ao enviar solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Excluir conta – EconomizeBem</title>
                <meta name="description" content="Solicite a exclusão permanente da sua conta e dados no EconomizeBem." />
            </Helmet>

            <div className="min-h-screen py-12" data-testid="excluir-conta-page">
                <div className="container-main max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Manrope']">
                        Excluir conta – EconomizeBem
                    </h1>

                    <div className="mt-6 mb-8 text-muted-foreground space-y-3 text-sm md:text-base">
                        <p>
                            Se você possui uma conta no EconomizeBem e deseja excluir permanentemente sua conta
                            e os dados associados, utilize o formulário abaixo. Após a solicitação, nossa equipe
                            processará a exclusão da conta e removerá todos os dados relacionados dentro do prazo
                            máximo de 7 dias.
                        </p>
                        <p className="flex items-center gap-2 text-red-500 font-medium">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Esta ação é irreversível.
                        </p>
                    </div>

                    {submitted ? (
                        <Card className="border-green-500" data-testid="success-message">
                            <CardContent className="py-10 text-center">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <h2 className="text-xl font-semibold mb-2">Solicitação recebida</h2>
                                <p className="text-muted-foreground">
                                    Sua solicitação de exclusão foi recebida. Nossa equipe irá processar o pedido em até 7 dias.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Solicitar exclusão</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <Label htmlFor="email">Email da conta *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            data-testid="delete-email-input"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="reason">Motivo da exclusão (opcional)</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Conte-nos por que deseja excluir sua conta..."
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows={3}
                                            data-testid="delete-reason-input"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-sm text-red-500" data-testid="delete-error">{error}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                                        data-testid="delete-submit-btn"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                        )}
                                        Solicitar exclusão da conta
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                            <Mail className="w-3 h-3" />
                            Se precisar de ajuda, entre em contato pelo email{' '}
                            <a href="mailto:suporte@economizebem.com.br" className="underline hover:text-foreground">
                                suporte@economizebem.com.br
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
