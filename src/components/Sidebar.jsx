import { Code, Server, Settings, Download, Trash2 } from 'lucide-react';

export default function Sidebar({
    apiConfig,
    setApiConfig,
    componentTypes,
    handleDragStart,
    handleDragEnd,
    handleExportCode,
    handleClearAll,
    routeCount,
    endpointCount,
    nestedEndpointCount,
    independentEndpointCount
}) {
    return (
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 p-4 flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <Code className="mr-2" size={24} />
                GenAPI
            </h2>
            <p className="text-sm text-gray-600 mb-6">Genera tu API visualmente</p>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Server size={16} className="mr-1" />
                    Configuración de la API
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={apiConfig.name}
                            onChange={(e) => setApiConfig(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Mi API"
                            spellCheck={false}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Puerto</label>
                        <input
                            type="number"
                            min="1"
                            max="65535"
                            value={apiConfig.port}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 65535)) {
                                    setApiConfig(prev => ({ ...prev, port: parseInt(value) || '' }));
                                }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="3000"
                            spellCheck={false}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            value={apiConfig.description}
                            onChange={(e) => setApiConfig(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder="Descripción de la API"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {componentTypes.map((component) => {
                    const IconComponent = component.icon;
                    return (
                        <div
                            key={component.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, component.type)}
                            onDragEnd={handleDragEnd}
                            className={`${component.color} text-white p-4 rounded-lg cursor-grab active:cursor-grabbing hover:opacity-90 transition-all shadow-md`}
                        >
                            <div className="flex items-center space-x-3 mb-2">
                                <IconComponent size={20} />
                                <span className="font-semibold">{component.name}</span>
                            </div>
                            <p className="text-xs opacity-90">{component.description}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Settings size={16} className="mr-1" />
                    Estadísticas
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Rutas:</span>
                        <span className="font-semibold text-blue-600">{routeCount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Endpoints independientes:</span>
                        <span className="font-semibold text-green-600">{independentEndpointCount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Endpoints anidados:</span>
                        <span className="font-semibold text-purple-600">{nestedEndpointCount}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold">
                        <span className="text-gray-700">Total endpoints:</span>
                        <span className="text-gray-800">{endpointCount}</span>
                    </div>
                </div>
            </div>

            <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xs font-semibold text-blue-800 mb-2">Cómo usar:</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Arrastra <strong>Rutas</strong> al área principal</li>
                    <li>• <strong>Arrastra componentes existentes</strong> para reubicarlos</li>
                    <li>• Arrastra elementos dentro de rutas para anidar</li>
                    <li>• Las rutas pueden contener subrutas</li>
                    <li>• Configura parámetros en cada endpoint</li>
                    <li>• Los paths se combinan automáticamente</li>
                </ul>
            </div>

            <div className="space-y-3 mt-auto">
                <button
                    onClick={handleExportCode}
                    className="w-full bg-purple-500 text-white p-3 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center border-0 outline-none focus:outline-none"
                >
                    <Download size={18} className="mr-2" />
                    Generar Código
                </button>

                <button
                    onClick={handleClearAll}
                    className="w-full bg-red-500 text-white p-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center border-0 outline-none focus:outline-none"
                >
                    <Trash2 size={18} className="mr-2" />
                    Limpiar Todo
                </button>
            </div>
        </div>
    );
}