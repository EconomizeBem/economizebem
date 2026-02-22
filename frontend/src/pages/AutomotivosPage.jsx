import { Car } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'pneus', name: 'Pneus', searchTerm: 'pneu carro' },
    { id: 'oleos', name: 'Óleos', searchTerm: 'oleo motor' },
    { id: 'pastilhas', name: 'Pastilhas de Freio', searchTerm: 'pastilha freio' },
    { id: 'higienizacao', name: 'Higienização', searchTerm: 'limpeza automotiva' },
    { id: 'acessorios', name: 'Acessórios', searchTerm: 'acessorio carro' },
];

export default function AutomotivosPage() {
    return (
        <CategoryPage
            title="Produtos Automotivos"
            subtitle="Encontre os melhores preços em produtos para seu veículo"
            defaultSearch="pneu"
            subcategories={subcategories}
            icon={Car}
            accentColor="sky"
            categorySlug="automotivo"
            metaDescription="Compare preços de produtos automotivos: pneus, óleos, pastilhas de freio, acessórios e produtos para seu veículo. Encontre ofertas no EconomizeBem."
        />
    );
}
