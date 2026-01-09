import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Plus, Trash2, Calculator as CalcIcon, PiggyBank, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { expensesApi } from '../lib/api';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';

const expenseCategories = [
    { id: 'aluguel', name: 'Aluguel', color: '#ef4444' },
    { id: 'agua', name: 'Água', color: '#0ea5e9' },
    { id: 'luz', name: 'Luz', color: '#eab308' },
    { id: 'internet', name: 'Internet', color: '#8b5cf6' },
    { id: 'mercado', name: 'Mercado', color: '#22c55e' },
    { id: 'transporte', name: 'Transporte', color: '#f97316' },
    { id: 'outros', name: 'Outros', color: '#6b7280' },
];

const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function CalculatorPage() {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('expenses');
    
    // Expenses state
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ category: '', description: '', amount: '' });
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
    const [summary, setSummary] = useState({ total: 0, by_category: {} });
    
    // Simulator state
    const [cashPrice, setCashPrice] = useState('');
    const [installmentPrice, setInstallmentPrice] = useState('');
    const [installments, setInstallments] = useState('12');
    const [simulatorResult, setSimulatorResult] = useState(null);
    
    // Salary converter state
    const [grossSalary, setGrossSalary] = useState('');
    const [netSalary, setNetSalary] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchExpenses();
        }
    }, [isAuthenticated, selectedMonth]);

    const fetchExpenses = async () => {
        try {
            const [expensesRes, summaryRes] = await Promise.all([
                expensesApi.getAll(selectedMonth),
                expensesApi.getSummary(selectedMonth)
            ]);
            setExpenses(expensesRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const handleAddExpense = async () => {
        if (!newExpense.category || !newExpense.amount) {
            toast.error('Preencha categoria e valor');
            return;
        }
        try {
            await expensesApi.create({
                category: newExpense.category,
                description: newExpense.description || expenseCategories.find(c => c.id === newExpense.category)?.name,
                amount: parseFloat(newExpense.amount),
                month: selectedMonth
            });
            toast.success('Despesa adicionada');
            setNewExpense({ category: '', description: '', amount: '' });
            fetchExpenses();
        } catch (error) {
            toast.error('Erro ao adicionar despesa');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            await expensesApi.delete(id);
            toast.success('Despesa removida');
            fetchExpenses();
        } catch (error) {
            toast.error('Erro ao remover despesa');
        }
    };

    const calculateSimulator = () => {
        const cash = parseFloat(cashPrice);
        const total = parseFloat(installmentPrice);
        const numInstallments = parseInt(installments);
        
        if (!cash || !total || !numInstallments) {
            toast.error('Preencha todos os campos');
            return;
        }

        const difference = total - cash;
        const percentDiff = ((total - cash) / cash * 100).toFixed(2);
        const monthlyInstallment = total / numInstallments;
        
        setSimulatorResult({
            cashPrice: cash,
            totalInstallment: total,
            monthlyPayment: monthlyInstallment,
            difference,
            percentDiff,
            recommendation: difference > 0 ? 'À vista' : 'Parcelado',
            savings: Math.abs(difference)
        });
    };

    const calculateNetSalary = () => {
        const gross = parseFloat(grossSalary);
        if (!gross) {
            toast.error('Informe o salário bruto');
            return;
        }

        // Simplified Brazilian tax calculation
        let inss = 0;
        if (gross <= 1412) inss = gross * 0.075;
        else if (gross <= 2666.68) inss = gross * 0.09;
        else if (gross <= 4000.03) inss = gross * 0.12;
        else inss = gross * 0.14;
        inss = Math.min(inss, 908.85);

        const baseIR = gross - inss;
        let ir = 0;
        if (baseIR > 4664.68) ir = baseIR * 0.275 - 896.00;
        else if (baseIR > 3751.05) ir = baseIR * 0.225 - 662.77;
        else if (baseIR > 2826.65) ir = baseIR * 0.15 - 381.44;
        else if (baseIR > 2259.20) ir = baseIR * 0.075 - 169.44;
        ir = Math.max(ir, 0);

        const net = gross - inss - ir;
        
        setNetSalary({
            gross,
            inss,
            ir,
            net,
            discountPercent: ((gross - net) / gross * 100).toFixed(1)
        });
    };

    const pieChartData = Object.entries(summary.by_category || {}).map(([key, value]) => ({
        name: expenseCategories.find(c => c.id === key)?.name || key,
        value,
        color: expenseCategories.find(c => c.id === key)?.color || '#6b7280'
    }));

    return (
        <div className="min-h-screen py-8" data-testid="calculator-page">
            <div className="container-main">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 font-['Manrope']">
                        Calculadora Financeira
                    </h1>
                    <p className="text-muted-foreground">
                        Ferramentas simples para organizar suas finanças
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-8 h-14">
                        <TabsTrigger value="expenses" className="h-12 gap-2" data-testid="tab-expenses">
                            <PiggyBank className="w-4 h-4" />
                            <span className="hidden sm:inline">Gastos</span>
                        </TabsTrigger>
                        <TabsTrigger value="simulator" className="h-12 gap-2" data-testid="tab-simulator">
                            <CalcIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Vale a Pena?</span>
                        </TabsTrigger>
                        <TabsTrigger value="salary" className="h-12 gap-2" data-testid="tab-salary">
                            <DollarSign className="w-4 h-4" />
                            <span className="hidden sm:inline">Salário</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Expenses Tab */}
                    <TabsContent value="expenses">
                        {!isAuthenticated ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <PiggyBank className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">Faça login para usar</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Crie uma conta gratuita para registrar e acompanhar seus gastos mensais.
                                    </p>
                                    <Button className="btn-primary" onClick={() => window.location.href = '/login'}>
                                        Fazer Login
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Add Expense Form */}
                                <Card className="lg:col-span-1">
                                    <CardHeader>
                                        <CardTitle>Adicionar Despesa</CardTitle>
                                        <CardDescription>Registre seus gastos mensais</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Mês</Label>
                                            <Input
                                                type="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                data-testid="month-input"
                                            />
                                        </div>
                                        <div>
                                            <Label>Categoria</Label>
                                            <Select value={newExpense.category} onValueChange={(v) => setNewExpense({...newExpense, category: v})}>
                                                <SelectTrigger data-testid="category-select">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expenseCategories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Descrição (opcional)</Label>
                                            <Input
                                                placeholder="Ex: Conta de luz"
                                                value={newExpense.description}
                                                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Valor (R$)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={newExpense.amount}
                                                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                                data-testid="amount-input"
                                            />
                                        </div>
                                        <Button className="w-full btn-primary" onClick={handleAddExpense} data-testid="add-expense-btn">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adicionar
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Summary & Chart */}
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Resumo do Mês</CardTitle>
                                        <CardDescription>Total: R$ {summary.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {pieChartData.length === 0 ? (
                                            <EmptyState type="expenses" />
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div className="h-64">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={60}
                                                                outerRadius={80}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="space-y-2">
                                                    {pieChartData.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                                <span>{item.name}</span>
                                                            </div>
                                                            <span className="font-semibold">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Expenses List */}
                                {expenses.length > 0 && (
                                    <Card className="lg:col-span-3">
                                        <CardHeader>
                                            <CardTitle>Despesas Registradas</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {expenses.map(expense => (
                                                    <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className="w-4 h-4 rounded-full" 
                                                                style={{ backgroundColor: expenseCategories.find(c => c.id === expense.category)?.color }}
                                                            />
                                                            <div>
                                                                <p className="font-medium">{expense.description}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {expenseCategories.find(c => c.id === expense.category)?.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="font-semibold">
                                                                R$ {expense.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                onClick={() => handleDeleteExpense(expense.id)}
                                                                className="text-red-500 hover:text-red-600"
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
                        )}
                    </TabsContent>

                    {/* Simulator Tab */}
                    <TabsContent value="simulator">
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vale a Pena Parcelar?</CardTitle>
                                    <CardDescription>Compare à vista vs parcelado</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Preço à vista (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 1000"
                                            value={cashPrice}
                                            onChange={(e) => setCashPrice(e.target.value)}
                                            data-testid="cash-price-input"
                                        />
                                    </div>
                                    <div>
                                        <Label>Valor total parcelado (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 1200"
                                            value={installmentPrice}
                                            onChange={(e) => setInstallmentPrice(e.target.value)}
                                            data-testid="installment-price-input"
                                        />
                                    </div>
                                    <div>
                                        <Label>Número de parcelas</Label>
                                        <Select value={installments} onValueChange={setInstallments}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[2, 3, 4, 5, 6, 10, 12, 18, 24].map(n => (
                                                    <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button className="w-full btn-primary" onClick={calculateSimulator} data-testid="calculate-btn">
                                        <CalcIcon className="w-4 h-4 mr-2" />
                                        Calcular
                                    </Button>
                                </CardContent>
                            </Card>

                            {simulatorResult && (
                                <Card className={simulatorResult.recommendation === 'À vista' ? 'border-sky-500' : 'border-amber-500'}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className={`w-5 h-5 ${simulatorResult.recommendation === 'À vista' ? 'text-sky-500' : 'text-amber-500'}`} />
                                            Resultado
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                                            <p className="text-sm text-muted-foreground">Recomendação</p>
                                            <p className={`text-2xl font-bold ${simulatorResult.recommendation === 'À vista' ? 'text-sky-600' : 'text-amber-600'}`}>
                                                Comprar {simulatorResult.recommendation}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">À vista</p>
                                                <p className="text-lg font-semibold">R$ {simulatorResult.cashPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Parcelado</p>
                                                <p className="text-lg font-semibold">R$ {simulatorResult.totalInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Parcela mensal</p>
                                                <p className="text-lg font-semibold">R$ {simulatorResult.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Economia</p>
                                                <p className={`text-lg font-semibold ${simulatorResult.difference > 0 ? 'text-sky-600' : 'text-amber-600'}`}>
                                                    R$ {simulatorResult.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Diferença de {simulatorResult.percentDiff}% entre as opções
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Salary Tab */}
                    <TabsContent value="salary">
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Salário Bruto → Líquido</CardTitle>
                                    <CardDescription>Estimativa de descontos (INSS + IR)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Salário Bruto (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 5000"
                                            value={grossSalary}
                                            onChange={(e) => setGrossSalary(e.target.value)}
                                            data-testid="gross-salary-input"
                                        />
                                    </div>
                                    <Button className="w-full btn-primary" onClick={calculateNetSalary} data-testid="calculate-salary-btn">
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Calcular
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        * Cálculo simplificado baseado nas tabelas de 2024. Não considera dependentes ou outras deduções.
                                    </p>
                                </CardContent>
                            </Card>

                            {netSalary && (
                                <Card className="border-sky-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-sky-500" />
                                            Resultado
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                                            <p className="text-sm text-muted-foreground">Salário Líquido Estimado</p>
                                            <p className="text-3xl font-bold text-sky-600">
                                                R$ {netSalary.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Salário Bruto</span>
                                                <span className="font-medium">R$ {netSalary.gross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-red-500">
                                                <span>(-) INSS</span>
                                                <span>R$ {netSalary.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between text-red-500">
                                                <span>(-) IR</span>
                                                <span>R$ {netSalary.ir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <hr />
                                            <div className="flex justify-between font-semibold">
                                                <span>Total descontos</span>
                                                <span>{netSalary.discountPercent}%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
