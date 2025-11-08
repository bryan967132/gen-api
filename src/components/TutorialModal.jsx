import { X, ChevronLeft, ChevronRight, CheckCircle, Check, BookOpen, Info, Route, Zap, Move, Hash, Globe, FileText, Code, Download, } from 'lucide-react';

export default function TutorialModal({
    showTutorialModal,
    tutorialStep,
    closeTutorial,
    prevTutorialStep,
    nextTutorialStep
}) {
    if (!showTutorialModal) return null;

    const tutorialContent = [
        {
            title: 'Bienvenido a GenAPI',
            content: (
                <div className="text-center p-8">
                    <div className="bg-purple-600 text-white p-8 rounded-xl mb-6">
                        <BookOpen size={64} className="mx-auto mb-4" />
                        <h3 className="text-2xl font-bold">GenAPI</h3>
                    </div>
                    <p className="text-gray-600 text-base leading-relaxed mb-4">
                        <strong>GenAPI</strong> es una herramienta visual para construir APIs REST de forma rápida e intuitiva.
                    </p>
                </div>
            )
        },
        {
            title: 'Configuración Inicial',
            content: (
                <div className="text-left p-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                        <div className="flex items-center mb-2">
                            <Info size={20} className="text-blue-500 mr-2" />
                            <strong className="text-gray-800">Configura tu API</strong>
                        </div>
                        <p className="text-gray-600 text-sm">
                            En la barra lateral izquierda encontrarás los campos para configurar:
                        </p>
                    </div>
                    
                    <div className="space-y-4 pl-4">
                        <div>
                            <div className="flex items-center mb-1">
                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                <strong className="text-sm text-gray-700">Nombre de la API</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">Identifica tu proyecto (ej: "API de E-commerce")</p>
                        </div>
                        
                        <div>
                            <div className="flex items-center mb-1">
                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                <strong className="text-sm text-gray-700">Puerto</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">Puerto donde correrá el servidor (ej: 3000, 8080)</p>
                        </div>
                        
                        <div>
                            <div className="flex items-center mb-1">
                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                <strong className="text-sm text-gray-700">Descripción</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">Breve descripción de tu API (opcional)</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Componentes',
            content: (
                <div className="text-left p-6">
                    <p className="text-gray-600 mb-6 text-sm">
                        GenAPI trabaja con dos tipos de componentes principales:
                    </p>
                    
                    <div className="bg-blue-500 text-white p-4 rounded-lg mb-4">
                        <div className="flex items-center mb-2">
                            <Route size={24} className="mr-3" />
                            <strong className="text-lg">Ruta</strong>
                        </div>
                        <p className="text-sm opacity-90 mb-3">
                            Contenedores que organizan tus endpoints. Puedes anidar rutas dentro de otras rutas para crear una estructura jerárquica.
                        </p>
                        <div className="bg-blue-600 p-2 rounded text-xs font-mono">
                            Ejemplo: /api/users, /api/products
                        </div>
                    </div>
                    
                    <div className="bg-green-500 text-white p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <Zap size={24} className="mr-3" />
                            <strong className="text-lg">Endpoint</strong>
                        </div>
                        <p className="text-sm opacity-90 mb-3">
                            Puntos específicos de tu API que responden a peticiones HTTP (GET, POST, PUT, DELETE, PATCH).
                        </p>
                        <div className="bg-green-600 p-2 rounded text-xs font-mono">
                            Ejemplo: GET /api/users/:id
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Arrastrar y Soltar',
            content: (
                <div className="text-left p-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
                        <div className="flex items-center mb-2">
                            <Move size={20} className="text-yellow-600 mr-2" />
                            <strong className="text-yellow-900">Interfaz Drag & Drop</strong>
                        </div>
                        <p className="text-yellow-800 text-sm">
                            Todo en GenAPI funciona mediante arrastrar y soltar. ¡Es muy fácil!
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 font-bold text-sm">1</div>
                                <strong className="text-sm text-gray-800">Crear componentes nuevos</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-10">
                                Arrastra una <strong>Ruta</strong> o <strong>Endpoint</strong> desde la barra lateral hacia el área principal.
                            </p>
                        </div>
                        
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 font-bold text-sm">2</div>
                                <strong className="text-sm text-gray-800">Anidar componentes</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-10">
                                Arrastra <strong>endpoints</strong> o <strong>subrutas</strong> DENTRO de una ruta existente para organizarlos.
                            </p>
                        </div>
                        
                        <div>
                            <div className="flex items-center mb-2">
                                <div className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 font-bold text-sm">3</div>
                                <strong className="text-sm text-gray-800">Reorganizar</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-10">
                                Arrastra componentes existentes para moverlos entre rutas o sacarlos al área principal.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Configurar Endpoints',
            content: (
                <div className="text-left p-6">
                    <p className="text-gray-600 mb-4 text-sm">
                        Después de crear un endpoint, haz clic en él para configurarlo:
                    </p>
                    
                    <div className="space-y-3">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <Hash size={18} className="text-blue-500 mr-2" />
                                <strong className="text-sm text-gray-800">Método HTTP</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">
                                GET, POST, PUT, DELETE, PATCH
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <Globe size={18} className="text-blue-500 mr-2" />
                                <strong className="text-sm text-gray-800">Path del Endpoint</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">
                                Ruta específica (ej: /users/:id, /login)
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <FileText size={18} className="text-blue-500 mr-2" />
                                <strong className="text-sm text-gray-800">Parámetros</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">
                                Route Params, Query Params, Body, Headers
                            </p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <Code size={18} className="text-blue-500 mr-2" />
                                <strong className="text-sm text-gray-800">Respuestas</strong>
                            </div>
                            <p className="text-gray-600 text-xs ml-6">
                                Define las respuestas de éxito y error con sus códigos de estado
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Generar tu API',
            content: (
                <div className="text-left p-6">
                    <p className="text-gray-600 mb-6 text-sm">
                        Cuando termines de diseñar tu API, genera el código:
                    </p>
                    
                    <div className="bg-purple-500 text-white p-6 rounded-lg mb-4 text-center">
                        <Download size={48} className="mx-auto mb-3" />
                        <p className="text-sm">
                            Haz clic en <strong>"Generar Código"</strong> en la barra lateral
                        </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-3">
                        <div className="flex items-start">
                            <CheckCircle size={20} className="text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-green-800 text-sm mb-1">Configuración Avanzada</p>
                                <p className="text-green-700 text-xs">
                                    Antes de generar podrás elegir si incluir archivo .env y conector de base de datos
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="flex items-start">
                            <Info size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-800 text-sm mb-1">Código listo para usar</p>
                                <p className="text-yellow-700 text-xs">
                                    El código se copiará automáticamente al portapapeles. Solo pégalo en tu archivo server.js
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4" 
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closeTutorial();
                }
            }}
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-fadeIn">
                <div className="border-b border-gray-200 p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{tutorialContent[tutorialStep].title}</h2>
                        <button
                            onClick={closeTutorial}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        {tutorialContent.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === tutorialStep 
                                        ? 'w-8 bg-purple-500' 
                                        : 'w-2 bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <div className="text-center text-gray-500 text-xs mt-2">
                        Paso {tutorialStep + 1} de {tutorialContent.length}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tutorialContent[tutorialStep].content}
                </div>

                <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50 rounded-b-xl">
                    <button
                        onClick={closeTutorial}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                        Salir
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {tutorialStep > 0 && (
                            <button
                                onClick={prevTutorialStep}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                            >
                                <ChevronLeft size={18} className="mr-1" />
                                Anterior
                            </button>
                        )}
                        
                        <button
                            onClick={nextTutorialStep}
                            className={`flex items-center px-5 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                                tutorialStep === tutorialContent.length - 1
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-purple-500 hover:bg-purple-600'
                            }`}
                        >
                            {tutorialStep === tutorialContent.length - 1 ? (
                                <>
                                    <Check size={18} className="mr-1" />
                                    Finalizar
                                </>
                            ) : (
                                <>
                                    Siguiente
                                    <ChevronRight size={18} className="ml-1" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}