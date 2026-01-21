import { Refrigerator } from 'lucide-react';
import CategoryPage from './CategoryPage';

const subcategories = [
    { id: 'frost-free', name: 'Frost Free', searchTerm: 'geladeira frost free' },
    { id: 'duplex', name: 'Duplex', searchTerm: 'geladeira duplex' },
    { id: 'inverse', name: 'Inverse', searchTerm: 'geladeira inverse' },
    { id: 'side-by-side', name: 'Side by Side', searchTerm: 'geladeira side by side' },
    { id: 'compacta', name: 'Compacta', searchTerm: 'geladeira compacta' },
    { id: 'french-door', name: 'French Door', searchTerm: 'geladeira french door' },
];

export default function GeladeirasPage() {
    return (
        <CategoryPage
            title="Geladeiras"
            subtitle="Compare preços de geladeiras e refrigeradores das melhores marcas"
            defaultSearch="geladeira"
            subcategories={subcategories}
            icon={Refrigerator}
            accentColor="sky"
        />
    );
}
