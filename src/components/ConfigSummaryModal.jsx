import { X, ArrowLeft, Download, AlertTriangle } from 'lucide-react';

export default function ConfigSummaryModal({
    showConfigSummary,
    apiConfig,
    tempUseEnv,
    tempUseDb,
    setShowConfigSummary,
    setShowCodeGenModal,
    handleGenerateAndCopy
}) {
    if (!showConfigSummary) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4" 
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setShowConfigSummary(false);
                }
            }}
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-fadeIn">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Código de la API: {apiConfig.name}</h2>
                        <button
                            onClick={() => setShowConfigSummary(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="text-gray-800 font-semibold mb-3">Especificaciones:</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="text-sm"><strong>Puerto:</strong> {apiConfig.port}</p>
                            <p className="text-sm"><strong>Descripción:</strong> {apiConfig.description || 'Sin descripción'}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-gray-800 font-semibold mb-3">Estructura de Proyecto:</h3>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1">
                            <div>mi-api/</div>
                            <div>├── node_modules/</div>
                            {(tempUseEnv || tempUseDb) && <div>├── .env                <span className="text-yellow-500">← Se generará</span></div>}
                            <div>├── package.json</div>
                            <div>├── server.js          <span className="text-gray-500">← Código generado</span></div>
                            <div>└── README.md</div>
                        </div>
                    </div>

                    {(tempUseEnv || tempUseDb) && (
                        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                            <div className="flex items-center">
                                <AlertTriangle className="text-yellow-600 mr-2 flex-shrink-0" size={18} />
                                <p className="text-yellow-800 text-sm font-medium">
                                    Se generará el archivo <strong>.env</strong> que deberás completar con tus credenciales
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50 rounded-b-xl">
                    <button
                        onClick={() => {
                            setShowConfigSummary(false);
                            setShowCodeGenModal(true);
                        }}
                        className="flex items-center px-4 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Volver a Configuración
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowConfigSummary(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleGenerateAndCopy}
                            className="flex items-center px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                            <Download size={18} className="mr-2" />
                            Generar y Copiar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}