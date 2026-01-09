import { Package, Wifi, Calculator, Search } from 'lucide-react';

export const EmptyState = ({ type = 'default', title, description, action }) => {
    const icons = {
        products: <Package className="w-16 h-16" />,
        plans: <Wifi className="w-16 h-16" />,
        calculator: <Calculator className="w-16 h-16" />,
        search: <Search className="w-16 h-16" />,
        default: <Package className="w-16 h-16" />
    };

    const defaultMessages = {
        products: {
            title: 'Nenhum produto encontrado',
            description: 'Tente buscar por outro termo ou categoria.'
        },
        plans: {
            title: 'Nenhum plano encontrado',
            description: 'Ajuste os filtros para ver mais opções.'
        },
        favorites: {
            title: 'Nenhum favorito ainda',
            description: 'Explore produtos e planos e adicione aos seus favoritos.'
        },
        alerts: {
            title: 'Nenhum alerta configurado',
            description: 'Crie alertas para ser notificado quando os preços baixarem.'
        },
        expenses: {
            title: 'Nenhuma despesa registrada',
            description: 'Comece a registrar suas despesas para acompanhar seus gastos.'
        },
        default: {
            title: 'Nada aqui ainda',
            description: 'Comece a explorar para ver conteúdo.'
        }
    };

    const message = defaultMessages[type] || defaultMessages.default;

    return (
        <div className="empty-state" data-testid={`empty-state-${type}`}>
            <div className="empty-state-icon text-muted-foreground">
                {icons[type] || icons.default}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title || message.title}</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">{description || message.description}</p>
            {action}
        </div>
    );
};
