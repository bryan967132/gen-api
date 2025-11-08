import { X, ArrowLeft, Download, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { generateEnvFile, generateAPICode } from '../utils/codeGenerator';

export default function ConfigSummaryModal({
    components,
    showConfigSummary,
    apiConfig,
    tempUseEnv,
    tempUseDb,
    tempDbType,
    getFullPath,
    setShowConfigSummary,
    setShowCodeGenModal,
}) {
    if (!showConfigSummary) return null;

    const handleGenerateAndCopy = async () => {
        const useEnv = tempUseEnv;
        const useDb = tempUseDb;
        const dbType = tempDbType;

        setShowConfigSummary(false);

        const code = generateAPICode(components, apiConfig, useEnv, { enabled: useDb, type: dbType }, getFullPath);
        const envContent = generateEnvFile(useEnv, { enabled: useDb, type: dbType });

        const endpointCount = components.filter(c => c.type === 'endpoint').length;

        try {
            await navigator.clipboard.writeText(code);

            if (envContent) {
                const blob = new Blob([envContent], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = '.env';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }

            let successMessage = `
                <p>El código de tu API ha sido copiado al portapapeles</p>
                <div style="margin-top: 15px; padding: 10px; background: #f0fdf4; border-radius: 6px; border-left: 4px solid #10b981;">
                    <p style="margin: 5px 0; font-size: 14px;">${endpointCount} endpoints configurados</p>
                    <p style="margin: 5px 0; font-size: 14px;">Servidor en puerto ${apiConfig.port}</p>
                    <p style="margin: 5px 0; font-size: 14px;">Listo para pegar en server.js</p>
                </div>
            `;

            if (envContent) {
                successMessage += `
                    <div style="margin-top: 15px; padding: 12px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <svg style="width: 20px; height: 20px; color: #f59e0b; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <h4 style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">Archivo .env generado</h4>
                        </div>
                        <p style="margin: 0; color: #92400e; font-size: 13px;">
                            El archivo <strong>.env</strong> ha sido descargado.<br/>
                            Completa los valores de las variables antes de ejecutar tu API.
                        </p>
                    </div>
                `;
            }

            if (useDb) {
                successMessage += `
                    <div style="margin-top: 15px; padding: 12px; background: #dbeafe; border-radius: 6px; border-left: 4px solid #3b82f6;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <svg style="width: 20px; height: 20px; color: #3b82f6; margin-right: 8px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                            </svg>
                            <h4 style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">Conector de base de datos generado</h4>
                        </div>
                        <p style="margin: 0; color: #1e40af; font-size: 13px;">
                            Base de datos <strong>${dbType.toUpperCase()}</strong> configurada<br/>
                            Completa las credenciales en el archivo .env descargado
                        </p>
                    </div>
                `;
            }

            await Swal.fire({
                icon: 'success',
                title: 'Código Generado',
                html: successMessage,
                confirmButtonColor: '#10b981',
                width: '650px',
                backdrop: `
                    rgba(0,0,0,0.6)
                    left top
                    no-repeat
                `,
                customClass: {
                    container: 'blur-backdrop'
                }
            });
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error al copiar',
                text: 'No se pudo copiar al portapapeles. Intenta manualmente.',
                confirmButtonColor: '#ef4444',
                backdrop: `
                    rgba(0,0,0,0.6)
                    left top
                    no-repeat
                `,
                customClass: {
                    container: 'blur-backdrop'
                }
            });
        }
    };

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