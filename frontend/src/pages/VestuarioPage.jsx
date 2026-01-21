import { Shirt } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'camisetas', name: 'Camisetas', searchTerm: 'camiseta' },
    { id: 'calcas', name: 'Calças', searchTerm: 'calça jeans' },
    { id: 'vestidos', name: 'Vestidos', searchTerm: 'vestido feminino' },
    { id: 'tenis', name: 'Tênis', searchTerm: 'tênis' },
    { id: 'sapatos', name: 'Sapatos', searchTerm: 'sapato' },
    { id: 'sandalias', name: 'Sandálias', searchTerm: 'sandália' },
    { id: 'jaquetas', name: 'Jaquetas', searchTerm: 'jaqueta' },
    { id: 'moletom', name: 'Moletons', searchTerm: 'moletom' },
];

export default function VestuarioPage() {
    return (
        <CategoryPage
            title="Vestuário"
            subtitle="Roupas, calçados e acessórios de moda com os melhores preços"
            defaultSearch="roupas moda"
            subcategories={subcategories}
            icon={Shirt}
            accentColor="sky"
        />
    );
}
