import { Refrigerator } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'geladeiras', name: 'Geladeiras', searchTerm: 'geladeira frost free' },
    { id: 'maquinas-lavar', name: 'Máquinas de Lavar', searchTerm: 'máquina de lavar roupa' },
    { id: 'fogoes', name: 'Fogões / Cooktops', searchTerm: 'fogão cooktop' },
    { id: 'micro-ondas', name: 'Micro-ondas', searchTerm: 'micro-ondas' },
    { id: 'ar-condicionado', name: 'Ar-condicionado', searchTerm: 'ar condicionado' },
    { id: 'aspirador', name: 'Aspiradores', searchTerm: 'aspirador de pó' },
];

export default function EletrodomesticosPage() {
    return (
        <CategoryPage
            title="Eletrodomésticos"
            subtitle="Geladeiras, máquinas de lavar, fogões e mais para sua casa"
            defaultSearch="geladeira"
            subcategories={subcategories}
            icon={Refrigerator}
            accentColor="sky"
            categorySlug="eletrodomesticos"
            metaDescription="Compare preços de eletrodomésticos: geladeiras, máquinas de lavar, fogões, micro-ondas e ar-condicionado. Economize nas melhores lojas do Brasil."
        />
    );
}
