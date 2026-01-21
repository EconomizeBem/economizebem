import { UtensilsCrossed } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'panelas', name: 'Panelas', searchTerm: 'jogo de panelas' },
    { id: 'talheres', name: 'Talheres', searchTerm: 'jogo de talheres' },
    { id: 'utensilios', name: 'Utensílios', searchTerm: 'utensílios de cozinha' },
    { id: 'organizadores', name: 'Organizadores', searchTerm: 'organizador cozinha' },
    { id: 'eletro', name: 'Eletroportáteis', searchTerm: 'eletroportáteis cozinha' },
    { id: 'pratos', name: 'Pratos e Louças', searchTerm: 'jogo de pratos' },
    { id: 'copos', name: 'Copos e Taças', searchTerm: 'jogo de copos' },
];

export default function CozinhaPage() {
    return (
        <CategoryPage
            title="Acessórios de Cozinha"
            subtitle="Utensílios, panelas, talheres e tudo para sua cozinha"
            defaultSearch="acessórios cozinha"
            subcategories={subcategories}
            icon={UtensilsCrossed}
            accentColor="sky"
        />
    );
}
