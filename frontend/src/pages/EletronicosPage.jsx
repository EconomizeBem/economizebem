import { Smartphone } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'celulares', name: 'Celulares', searchTerm: 'smartphone' },
    { id: 'tvs', name: 'TVs', searchTerm: 'smart tv' },
    { id: 'notebooks', name: 'Notebooks', searchTerm: 'notebook' },
    { id: 'fones', name: 'Fones de Ouvido', searchTerm: 'fone bluetooth' },
    { id: 'smartwatches', name: 'Smartwatches', searchTerm: 'smartwatch' },
    { id: 'consoles', name: 'Consoles', searchTerm: 'console videogame' },
];

export default function EletronicosPage() {
    return (
        <CategoryPage
            title="Eletrônicos"
            subtitle="Smartphones, TVs, notebooks e mais com os melhores preços"
            defaultSearch="smartphone celular"
            subcategories={subcategories}
            icon={Smartphone}
            accentColor="sky"
            categorySlug="eletronicos"
            metaDescription="Compare preços de eletrônicos: celulares, TVs, notebooks, fones de ouvido e smartwatches. Encontre as melhores ofertas e economize no EconomizeBem."
        />
    );
}
