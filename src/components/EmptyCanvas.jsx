import { Code, Server } from 'lucide-react';

export default function EmptyCanvas() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
                <div className="flex justify-center space-x-4 mb-4">
                    <Code size={64} className="opacity-50" />
                    <Server size={64} className="opacity-50" />
                </div>
                <p className="text-xl font-medium mb-2">¡Comienza a construir tu API!</p>
                <p className="text-gray-500 mb-4">Arrastra componentes aquí para empezar</p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Las <strong>rutas</strong> organizan tus endpoints</li>
                    <li>Los <strong>endpoints</strong> definen las respuestas</li>
                    <li>Puedes anidar rutas dentro de rutas</li>
                    <li><strong>Arrastra componentes existentes</strong> para reorganizar</li>
                </ul>
            </div>
        </div>
    );
}
