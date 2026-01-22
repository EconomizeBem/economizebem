import { UtensilsCrossed } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'panelas', name: 'Panelas', searchTerm: 'jogo de panelas' },
    { id: 'talheres', name: 'Talheres', searchTerm: 'talheres inox' },
    { id: 'utensilios', name: 'Utensílios de Cozinha', searchTerm: 'utensílios de cozinha' },
    { id: 'cafeteiras', name: 'Cafeteiras', searchTerm: 'cafeteira' },
    { id: 'organizacao', name: 'Organização Doméstica', searchTerm: 'organizadores domésticos' },
    { id: 'pratos', name: 'Pratos e Louças', searchTerm: 'jogo de pratos' },
    { id: 'copos', name: 'Copos e Taças', searchTerm: 'jogo de copos' },
];

export default function CasaCozinhaPage() {
    return (
        <CategoryPage
            title="Casa & Cozinha"
            subtitle="Panelas, talheres, utensílios e tudo para organizar sua casa"
            defaultSearch="utensilios cozinha"
            subcategories={subcategories}
            icon={UtensilsCrossed}
            accentColor="sky"
            categorySlug="casa-cozinha"
            metaDescription="Compare preços de produtos para casa e cozinha: panelas, talheres, utensílios, cafeteiras e organizadores. Encontre ofertas no EconomizeBem."
        />
    );
}
