import { Sparkles } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'maquiagem', name: 'Maquiagem', searchTerm: 'maquiagem' },
    { id: 'skincare', name: 'Cuidados com a Pele', searchTerm: 'skincare' },
    { id: 'cabelo', name: 'Cabelo', searchTerm: 'produtos para cabelo' },
    { id: 'higiene', name: 'Higiene Pessoal', searchTerm: 'higiene pessoal' },
    { id: 'perfumes', name: 'Perfumes', searchTerm: 'perfume' },
    { id: 'saude', name: 'Saúde e Bem-estar', searchTerm: 'suplementos vitaminas' },
];

export default function BelezaSaudePage() {
    return (
        <CategoryPage
            title="Beleza & Saúde"
            subtitle="Maquiagem, skincare, cabelo e produtos de higiene"
            defaultSearch="maquiagem perfume"
            subcategories={subcategories}
            icon={Sparkles}
            accentColor="sky"
            categorySlug="beleza-saude"
            metaDescription="Compare preços de beleza e saúde: maquiagem, skincare, produtos para cabelo, perfumes e higiene pessoal. Economize no EconomizeBem."
        />
    );
}
