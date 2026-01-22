import { PawPrint } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'racao-cachorro', name: 'Ração para Cachorro', searchTerm: 'ração para cachorro' },
    { id: 'racao-gato', name: 'Ração para Gato', searchTerm: 'ração para gato' },
    { id: 'petiscos', name: 'Petiscos', searchTerm: 'petiscos para pets' },
    { id: 'acessorios', name: 'Acessórios Pet', searchTerm: 'acessórios para pets' },
    { id: 'higiene-pet', name: 'Higiene Pet', searchTerm: 'shampoo pet' },
    { id: 'brinquedos', name: 'Brinquedos Pet', searchTerm: 'brinquedos para cachorro' },
];

export default function PetsPage() {
    return (
        <CategoryPage
            title="Pets"
            subtitle="Ração, petiscos, acessórios e produtos para seu pet"
            defaultSearch="racao"
            subcategories={subcategories}
            icon={PawPrint}
            accentColor="sky"
            categorySlug="pets"
            metaDescription="Compare preços de produtos para pets: ração para cachorro e gato, petiscos, acessórios e produtos de higiene. Cuide do seu pet e economize."
        />
    );
}
