import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function TutorialModal({
    showTutorialModal,
    tutorialStep,
    tutorialContent,
    closeTutorial,
    prevTutorialStep,
    nextTutorialStep
}) {
    if (!showTutorialModal) return null;

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