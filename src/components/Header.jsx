import { Globe, HelpCircle } from 'lucide-react';

export default function Header({ apiConfig, routeCount, independentEndpointCount, nestedEndpointCount, onShowTutorial }) {
    return (
        <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Globe className="mr-2" size={28} />
                        {apiConfig.name}
                    </h1>
                    <p className="text-gray-600">
                        Puerto {apiConfig.port} • {routeCount} rutas • {independentEndpointCount} endpoints independientes • {nestedEndpointCount} endpoints anidados
                    </p>
                    {apiConfig.description && (
                        <p className="text-sm text-gray-500 mt-1">{apiConfig.description}</p>
                    )}
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onShowTutorial}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors shadow-sm border-0 outline-none focus:outline-none"
                        title="Ver Tutorial"
                    >
                        <HelpCircle size={18} className="mr-2" />
                        Ayuda
                    </button>
                    <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                            <span>Servidor: localhost:{apiConfig.port}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}