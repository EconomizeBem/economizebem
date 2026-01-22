import { Shirt } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'tenis', name: 'Tênis', searchTerm: 'tênis' },
    { id: 'roupas-masculinas', name: 'Roupas Masculinas', searchTerm: 'roupa masculina' },
    { id: 'roupas-femininas', name: 'Roupas Femininas', searchTerm: 'roupa feminina' },
    { id: 'calcados', name: 'Calçados', searchTerm: 'calçados' },
    { id: 'camisetas', name: 'Camisetas', searchTerm: 'camiseta' },
    { id: 'jaquetas', name: 'Jaquetas', searchTerm: 'jaqueta' },
    { id: 'vestidos', name: 'Vestidos', searchTerm: 'vestido feminino' },
];

export default function VestuarioPageNew() {
    return (
        <CategoryPage
            title="Vestuário"
            subtitle="Roupas, calçados e acessórios de moda com os melhores preços"
            defaultSearch="roupa"
            subcategories={subcategories}
            icon={Shirt}
            accentColor="sky"
            categorySlug="vestuario"
            metaDescription="Compare preços de vestuário: roupas masculinas, femininas, tênis, calçados e acessórios. Encontre ofertas de moda no EconomizeBem."
        />
    );
}
