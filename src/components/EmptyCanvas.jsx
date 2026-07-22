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
                <div className="text-sm text-gray-400 space-y-1">
                    <p>• Las <strong>rutas</strong> organizan tus endpoints</p>
                    <p>• Los <strong>endpoints</strong> definen las respuestas</p>
                    <p>• Puedes anidar rutas dentro de rutas</p>
                    <p>• <strong>Arrastra componentes existentes</strong> para reorganizar</p>
                </div>
            </div>
        </div>
    );
}