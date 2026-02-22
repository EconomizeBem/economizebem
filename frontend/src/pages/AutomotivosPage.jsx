import { Car } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    // Pneus
    { id: 'pneus', name: 'Pneus', searchTerm: 'pneu carro' },
    { id: 'pneu-aro-13', name: 'Pneu Aro 13', searchTerm: 'pneu 13' },
    { id: 'pneu-aro-14', name: 'Pneu Aro 14', searchTerm: 'pneu 14' },
    { id: 'pneu-aro-15', name: 'Pneu Aro 15', searchTerm: 'pneu 15' },
    { id: 'pneu-aro-16', name: 'Pneu Aro 16', searchTerm: 'pneu 16' },
    { id: 'pneu-aro-17', name: 'Pneu Aro 17', searchTerm: 'pneu 17' },
    { id: 'pneu-aro-18', name: 'Pneu Aro 18', searchTerm: 'pneu 18' },
    // Óleos Automotivos
    { id: 'oleos', name: 'Óleos Automotivos', searchTerm: 'oleo motor automotivo' },
    { id: 'oleo-5w30', name: 'Óleo 5W30', searchTerm: 'oleo motor 5w30' },
    { id: 'oleo-5w40', name: 'Óleo 5W40', searchTerm: 'oleo motor 5w40' },
    { id: 'oleo-10w40', name: 'Óleo 10W40', searchTerm: 'oleo motor 10w40' },
    { id: 'oleo-15w40', name: 'Óleo 15W40', searchTerm: 'oleo motor 15w40' },
    { id: 'oleo-20w50', name: 'Óleo 20W50', searchTerm: 'oleo motor 20w50' },
    // Pastilhas e Baterias
    { id: 'pastilhas', name: 'Pastilhas de Freio', searchTerm: 'pastilha freio' },
    { id: 'baterias', name: 'Baterias Automotivas', searchTerm: 'bateria automotiva carro' },
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
            metaDescription="Compare preços de produtos automotivos: pneus, óleos, pastilhas de freio, baterias e produtos para seu veículo. Encontre ofertas no EconomizeBem."
        />
    );
}
