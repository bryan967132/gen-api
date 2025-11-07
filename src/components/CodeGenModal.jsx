import { X, ChevronRight, Lock, Database } from 'lucide-react';

export default function CodeGenModal({
    showCodeGenModal,
    tempUseEnv,
    setTempUseEnv,
    tempUseDb,
    setTempUseDb,
    tempDbType,
    setTempDbType,
    setShowCodeGenModal,
    handleContinueFromConfig
}) {
    if (!showCodeGenModal) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4" 
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setShowCodeGenModal(false);
                }
            }}
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full animate-fadeIn">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Configuración del Proyecto</h2>
                        <button
                            onClick={() => setShowCodeGenModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">Selecciona las opciones para tu proyecto</p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                        <label className="flex items-center justify-between mb-3 cursor-pointer">
                            <div className="flex items-center">
                                <Lock className="text-blue-600 mr-2" size={20} />
                                <div>
                                    <h3 className="font-bold text-gray-800">Variables de Entorno</h3>
                                    <p className="text-sm text-gray-600">Usar archivo .env para configuración</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={tempUseEnv}
                                    onChange={(e) => setTempUseEnv(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                        <label className="flex items-center justify-between mb-3 cursor-pointer">
                            <div className="flex items-center">
                                <Database className="text-purple-600 mr-2" size={20} />
                                <div>
                                    <h3 className="font-bold text-gray-800">Conector de Base de Datos</h3>
                                    <p className="text-sm text-gray-600">Incluir configuración de base de datos</p>
                                </div>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={tempUseDb}
                                    onChange={(e) => setTempUseDb(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </div>
                        </label>
                        
                        {tempUseDb && (
                            <div className="pt-3 border-t border-gray-300 mt-3">
                                <label className="block font-medium text-gray-700 mb-2 text-sm">Tipo de Base de Datos</label>
                                <select
                                    value={tempDbType}
                                    onChange={(e) => setTempDbType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none focus:outline-none"
                                >
                                    <option value="mysql">MySQL</option>
                                    <option value="oracle">Oracle SQL</option>
                                    <option value="postgresql">PostgreSQL</option>
                                    <option value="mssql">Microsoft SQL Server</option>
                                    <option value="mongodb">MongoDB</option>
                                    <option value="redis">Redis</option>
                                </select>
                                <div className="bg-blue-50 p-3 rounded-lg mt-3 border-l-4 border-blue-500">
                                    <div className="flex items-center text-blue-800 text-xs">
                                        <Lock size={14} className="mr-2 flex-shrink-0" />
                                        Las credenciales se configurarán en el archivo .env
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-200 p-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={() => setShowCodeGenModal(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleContinueFromConfig}
                        className="flex items-center px-5 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                    >
                        Continuar
                        <ChevronRight size={18} className="ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}