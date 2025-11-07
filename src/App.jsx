import { useState, useRef, useEffect } from 'react';
import { Route, Zap, Code, Settings, Download, Trash2, ChevronDown, ChevronUp, Move, Server, Globe, Hash, FileText, User, Search, HelpCircle, X, ChevronLeft, ChevronRight, Lock, RefreshCw, CheckCircle, AlertTriangle, Info, Database, BookOpen, ArrowLeft, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { generateDatabaseConnector, generateEnvFile, generateAPICode } from './utils/codeGenerator';
import Sidebar from './components/Sidebar';
import TutorialModal from './components/TutorialModal';
import CodeGenModal from './components/CodeGenModal';
import ConfigSummaryModal from './components/ConfigSummaryModal';

export default function App() {
    const [apiConfig, setApiConfig] = useState({
        name: 'Mi API',
        port: 3000,
        description: 'API generada con GenAPI'
    });
    
    const [components, setComponents] = useState([]);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [isDragOver, setIsDragOver] = useState(null);
    const [draggedComponent, setDraggedComponent] = useState(null);
    const dragCounter = useRef(0);
    
    // Estados para el modal del tutorial
    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    
    // Estados para el modal de generación de código
    const [showCodeGenModal, setShowCodeGenModal] = useState(false);
    const [showConfigSummary, setShowConfigSummary] = useState(false);
    const [tempUseEnv, setTempUseEnv] = useState(true);
    const [tempUseDb, setTempUseDb] = useState(false);
    const [tempDbType, setTempDbType] = useState('mysql');
    
    // Nueva configuración para variables de entorno y base de datos
    const [useEnvironmentVariables, setUseEnvironmentVariables] = useState(true);
    const [databaseConfig, setDatabaseConfig] = useState({
        enabled: false,
        type: 'mysql' // mysql, oracle, postgresql, mssql, mongodb, redis
    });

    // Hook para cerrar modales con tecla ESC
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                if (showTutorialModal) {
                    setShowTutorialModal(false);
                } else if (showConfigSummary) {
                    setShowConfigSummary(false);
                } else if (showCodeGenModal) {
                    setShowCodeGenModal(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, [showTutorialModal, showConfigSummary, showCodeGenModal]);

    const componentTypes = [
        { 
            type: 'route', 
            icon: Route, 
            name: 'Ruta', 
            color: 'bg-blue-500',
            description: 'Contenedor para endpoints y subrutas'
        },
        { 
            type: 'endpoint', 
            icon: Zap, 
            name: 'Endpoint', 
            color: 'bg-green-500',
            description: 'Endpoint HTTP individual'
        }
    ];

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    const getMethodColor = (method) => {
        const colors = {
            'GET': 'bg-blue-100 text-blue-700 border-blue-200',
            'POST': 'bg-green-100 text-green-700 border-green-200',
            'PUT': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'DELETE': 'bg-red-100 text-red-700 border-red-200',
            'PATCH': 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return colors[method] || 'bg-gray-100 text-gray-700 border-gray-200';
    };
    
    const parameterTypes = [
        { value: 'none', label: 'Sin parámetros', icon: null },
        { value: 'route', label: 'Route Params', icon: Hash },
        { value: 'query', label: 'Query Params', icon: Search },
        { value: 'body', label: 'Body', icon: FileText },
        { value: 'headers', label: 'Headers', icon: User }
    ];

    // Drag desde la barra lateral (nuevo componente)
    const handleDragStart = (e, componentType) => {
        e.dataTransfer.setData('componentType', componentType);
        e.dataTransfer.effectAllowed = 'copy';
        dragCounter.current = 0;
    };

    // Drag desde un componente existente
    const handleComponentDragStart = (e, component) => {
        e.stopPropagation();
        e.dataTransfer.setData('componentId', component.id.toString());
        e.dataTransfer.effectAllowed = 'move';
        setDraggedComponent(component);
        dragCounter.current = 0;
    };

    const handleDragEnd = () => {
        setDraggedComponent(null);
        setIsDragOver(null);
        dragCounter.current = 0;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedComponent ? 'move' : 'copy';
    };

    const handleMainAreaDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        if (dragCounter.current === 1) {
            setIsDragOver('main');
        }
    };

    const handleMainAreaDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragOver(null);
        }
    };

    const handleRouteDragEnter = (e, routeId) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(routeId);
    };

    const handleRouteDragLeave = (e, routeId) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDragOver(null);
        }
    };

    const handleMainDrop = (e) => {
        e.preventDefault();
        setIsDragOver(null);
        dragCounter.current = 0;
        
        const componentId = e.dataTransfer.getData('componentId');
        const componentType = e.dataTransfer.getData('componentType');
        
        // Moviendo componente existente
        if (componentId) {
            const movedId = parseFloat(componentId); // ¡CAMBIO AQUÍ!
            
            setComponents(prev => {
                const movedComponent = prev.find(c => c.id === movedId);
                if (!movedComponent) {
                    console.log('[ERROR] Componente no encontrado:', movedId);
                    return prev;
                }

                console.log('[INFO] Moviendo componente al área principal:', movedComponent);
                const oldParentId = movedComponent.parentRoute;
                console.log('[INFO] Padre anterior:', oldParentId);

                // Actualizar todo en una pasada
                const newState = prev.map(comp => {
                    // Si es el padre anterior, removerlo de sus arrays
                    if (comp.id === oldParentId) {
                        console.log('[INFO] Removiendo de padre:', comp.name || comp.path);
                        return {
                            ...comp,
                            endpoints: comp.endpoints.filter(id => id !== movedId),
                            subRoutes: comp.subRoutes.filter(id => id !== movedId)
                        };
                    }
                    // Si es el componente que movemos, actualizar su parent
                    if (comp.id === movedId) {
                        console.log('[SUCCESS] Actualizando componente - nuevo parent: null');
                        return { 
                            ...comp, 
                            parentRoute: null, 
                            level: 0 
                        };
                    }
                    return comp;
                });
                
                console.log('[DEBUG] Nuevo estado:', newState);
                return newState;
            });
            
            setDraggedComponent(null);
            return;
        }

        // Creando nuevo componente
        const newComponent = {
            id: Date.now() + Math.random(),
            type: componentType,
            expanded: true,
            parentRoute: null,
            level: 0,
            ...(componentType === 'route' ? {
                name: 'Nueva Ruta',
                basePath: '/api',
                endpoints: [],
                subRoutes: []
            } : {
                method: 'GET',
                path: '/example',
                parameterType: 'none',
                routeParams: [],
                queryParams: [],
                bodyParams: [],
                headerParams: [],
                successResponse: {
                    statusCode: 200,
                    fields: [
                        { key: 'message', value: 'Success' },
                        { key: 'data', value: '{}' }
                    ]
                },
                errorResponse: {
                    statusCode: 500,
                    fields: [
                        { key: 'error', value: 'Something went wrong' }
                    ]
                }
            })
        };

        setComponents(prev => [...prev, newComponent]);
    };

    const handleRouteDrop = (e, routeId) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(null);
        
        const componentId = e.dataTransfer.getData('componentId');
        const componentType = e.dataTransfer.getData('componentType');

        // Moviendo componente existente
        if (componentId) {
            const movedId = parseFloat(componentId); // ¡CAMBIO AQUÍ!
            
            setComponents(prev => {
                const movedComponent = prev.find(c => c.id === movedId);
                const targetRoute = prev.find(c => c.id === routeId);
                
                if (!movedComponent || !targetRoute || movedId === routeId) return prev;

                // Prevenir anidación circular
                if (movedComponent.type === 'route') {
                    const isDescendant = (checkId, ancestorId) => {
                        const comp = prev.find(c => c.id === checkId);
                        if (!comp || !comp.parentRoute) return false;
                        if (comp.parentRoute === ancestorId) return true;
                        return isDescendant(comp.parentRoute, ancestorId);
                    };

                    if (isDescendant(routeId, movedId)) {
                        setTimeout(() => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Anidación Circular',
                                text: 'No puedes anidar una ruta dentro de su propia subruta',
                                confirmButtonColor: '#ef4444'
                            });
                        }, 0);
                        return prev;
                    }
                }

                const oldParentId = movedComponent.parentRoute;

                // Actualizar todo en una pasada
                return prev.map(comp => {
                    // Si es el padre anterior, removerlo
                    if (comp.id === oldParentId) {
                        return {
                            ...comp,
                            endpoints: comp.endpoints.filter(id => id !== movedId),
                            subRoutes: comp.subRoutes.filter(id => id !== movedId)
                        };
                    }
                    // Si es el nuevo padre, agregarlo (evitar duplicados)
                    if (comp.id === routeId) {
                        if (movedComponent.type === 'endpoint') {
                            const alreadyHas = comp.endpoints.includes(movedId);
                            return { 
                                ...comp, 
                                endpoints: alreadyHas ? comp.endpoints : [...comp.endpoints, movedId]
                            };
                        } else {
                            const alreadyHas = comp.subRoutes.includes(movedId);
                            return { 
                                ...comp, 
                                subRoutes: alreadyHas ? comp.subRoutes : [...comp.subRoutes, movedId]
                            };
                        }
                    }
                    // Si es el componente movido, actualizar su parent
                    if (comp.id === movedId) {
                        return { 
                            ...comp, 
                            parentRoute: routeId, 
                            level: targetRoute.level + 1 
                        };
                    }
                    return comp;
                });
            });

            setDraggedComponent(null);
            return;
        }

        // Creando nuevo componente
        setComponents(prev => {
            const targetRoute = prev.find(c => c.id === routeId);
            if (!targetRoute) return prev;

            if (componentType === 'endpoint') {
                const newEndpoint = {
                    id: Date.now() + Math.random(),
                    type: 'endpoint',
                    expanded: true,
                    parentRoute: routeId,
                    level: targetRoute.level + 1,
                    method: 'GET',
                    path: '/example',
                    parameterType: 'none',
                    routeParams: [],
                    queryParams: [],
                    bodyParams: [],
                    headerParams: [],
                    successResponse: {
                        statusCode: 200,
                        fields: [
                            { key: 'message', value: 'Success' },
                            { key: 'data', value: '{}' }
                        ]
                    },
                    errorResponse: {
                        statusCode: 500,
                        fields: [
                            { key: 'error', value: 'Something went wrong' }
                        ]
                    }
                };

                return [
                    ...prev.map(comp => 
                        comp.id === routeId 
                        ? { ...comp, endpoints: [...comp.endpoints, newEndpoint.id] }
                        : comp
                    ),
                    newEndpoint
                ];
            } else if (componentType === 'route') {
                const newSubRoute = {
                    id: Date.now() + Math.random(),
                    type: 'route',
                    expanded: true,
                    parentRoute: routeId,
                    level: targetRoute.level + 1,
                    name: 'Nueva Subruta',
                    basePath: '/subruta',
                    endpoints: [],
                    subRoutes: []
                };

                return [
                    ...prev.map(comp => 
                        comp.id === routeId 
                        ? { ...comp, subRoutes: [...comp.subRoutes, newSubRoute.id] }
                        : comp
                    ),
                    newSubRoute
                ];
            }
            
            return prev;
        });
    };

    const handleComponentClick = (component, e) => {
        e.stopPropagation();
        setSelectedComponent(component.id);
    };

    const handleCanvasClick = () => {
        setSelectedComponent(null);
    };

    const deleteComponent = (id) => {
        const component = components.find(c => c.id === id);

        if (component.type === 'route') {
            const getAllDescendants = (routeId) => {
                const route = components.find(c => c.id === routeId);
                let descendants = [];
                
                if (route.endpoints) {
                    descendants.push(...route.endpoints);
                }
                
                if (route.subRoutes) {
                    route.subRoutes.forEach(subRouteId => {
                        descendants.push(subRouteId);
                        descendants.push(...getAllDescendants(subRouteId));
                    });
                }

                return descendants;
            };

            const descendantsToDelete = getAllDescendants(id);
            
            // Remover del padre si tiene
            if (component.parentRoute) {
                setComponents(prev => prev.map(comp => 
                    comp.id === component.parentRoute 
                    ? { ...comp, subRoutes: comp.subRoutes.filter(sId => sId !== id) }
                    : comp
                ));
            }
            
            setComponents(prev => prev.filter(comp => 
                comp.id !== id && !descendantsToDelete.includes(comp.id)
            ));
        } else {
            if (component.parentRoute) {
                setComponents(prev => prev.map(comp => 
                    comp.id === component.parentRoute 
                    ? { ...comp, endpoints: comp.endpoints.filter(epId => epId !== id) }
                    : comp
                ));
            }
            setComponents(prev => prev.filter(comp => comp.id !== id));
        }
        setSelectedComponent(null);
    };

    const updateComponent = (id, updates) => {
        setComponents(components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
        ));
    };

    const toggleExpanded = (id) => {
        updateComponent(id, { expanded: !components.find(c => c.id === id).expanded });
    };

    // Funciones para manejar parámetros dinámicos
    const addParameter = (componentId, paramType, paramName) => {
        if (!paramName.trim()) return;
        
        const component = components.find(c => c.id === componentId);
        if (!component) return;
        
        const paramKey = {
            'route': 'routeParams',
            'query': 'queryParams',
            'body': 'bodyParams',
            'headers': 'headerParams'
        }[paramType];
        
        if (!paramKey) return;
        
        // Evitar duplicados
        if (component[paramKey].includes(paramName.trim())) {
            return;
        }
        
        updateComponent(componentId, {
            [paramKey]: [...component[paramKey], paramName.trim()]
        });
    };

    const removeParameter = (componentId, paramType, paramName) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;
        
        const paramKey = {
            'route': 'routeParams',
            'query': 'queryParams',
            'body': 'bodyParams',
            'headers': 'headerParams'
        }[paramType];
        
        if (!paramKey) return;
        
        updateComponent(componentId, {
            [paramKey]: component[paramKey].filter(p => p !== paramName)
        });
    };

    // Funciones para manejar respuestas
    const addResponseField = (componentId, responseType, key, value) => {
        if (!key.trim()) return;
        
        const component = components.find(c => c.id === componentId);
        if (!component) return;
        
        const responseKey = responseType === 'success' ? 'successResponse' : 'errorResponse';
        const currentResponse = component[responseKey];
        
        // Evitar claves duplicadas
        if (currentResponse.fields.some(f => f.key === key.trim())) {
            return;
        }
        
        updateComponent(componentId, {
            [responseKey]: {
                ...currentResponse,
                fields: [...currentResponse.fields, { key: key.trim(), value: value || '' }]
            }
        });
    };

    const removeResponseField = (componentId, responseType, fieldKey) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;
        
        const responseKey = responseType === 'success' ? 'successResponse' : 'errorResponse';
        const currentResponse = component[responseKey];
        
        updateComponent(componentId, {
            [responseKey]: {
                ...currentResponse,
                fields: currentResponse.fields.filter(f => f.key !== fieldKey)
            }
        });
    };

    const updateResponseField = (componentId, responseType, fieldKey, newValue) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;
        
        const responseKey = responseType === 'success' ? 'successResponse' : 'errorResponse';
        const currentResponse = component[responseKey];
        
        updateComponent(componentId, {
            [responseKey]: {
                ...currentResponse,
                fields: currentResponse.fields.map(f => 
                    f.key === fieldKey ? { ...f, value: newValue } : f
                )
            }
        });
    };

    const updateStatusCode = (componentId, responseType, statusCode) => {
        const component = components.find(c => c.id === componentId);
        if (!component) return;
        
        const responseKey = responseType === 'success' ? 'successResponse' : 'errorResponse';
        const currentResponse = component[responseKey];
        
        updateComponent(componentId, {
            [responseKey]: {
                ...currentResponse,
                statusCode: parseInt(statusCode)
            }
        });
    };

    const getFullPath = (component) => {
        if (!component.parentRoute) return component.path;

        const parentRoute = components.find(c => c.id === component.parentRoute);
        if (!parentRoute) return component.path;

        const parentPath = getFullRoutePath(parentRoute);
        return parentPath + component.path;
    };

    const getFullRoutePath = (route) => {
        if (!route.parentRoute) return route.basePath;

        const parentRoute = components.find(c => c.id === route.parentRoute);
        if (!parentRoute) return route.basePath;

        return getFullRoutePath(parentRoute) + route.basePath;
    };

    // Validaciones de duplicados
    const validateDuplicates = () => {
        const errors = [];

        // Validar rutas duplicadas en el mismo nivel
        const routes = components.filter(c => c.type === 'route');
        const routeGroups = {};

        routes.forEach(route => {
            const key = `${route.parentRoute || 'root'}_${route.basePath}`;
            if (!routeGroups[key]) {
                routeGroups[key] = [];
            }
            routeGroups[key].push(route);
        });

        Object.entries(routeGroups).forEach(([key, group]) => {
            if (group.length > 1) {
                const parentName = group[0].parentRoute 
                    ? routes.find(r => r.id === group[0].parentRoute)?.name || 'Ruta padre'
                    : 'Nivel raíz';
                errors.push({
                    type: 'route',
                    message: `Ruta duplicada "${group[0].basePath}" en ${parentName} (${group.length} rutas con el mismo path)`
                });
            }
        });

        // Validar endpoints duplicados en el mismo nivel (mismo path y método)
        const endpoints = components.filter(c => c.type === 'endpoint');
        const endpointGroups = {};

        endpoints.forEach(endpoint => {
            const fullPath = getFullPath(endpoint);
            const key = `${endpoint.method}_${fullPath}`;
            if (!endpointGroups[key]) {
                endpointGroups[key] = [];
            }
            endpointGroups[key].push(endpoint);
        });

        Object.entries(endpointGroups).forEach(([key, group]) => {
            if (group.length > 1) {
                errors.push({
                    type: 'endpoint',
                    message: `Endpoint duplicado: ${group[0].method} ${getFullPath(group[0])} (${group.length} endpoints con la misma combinación)`
                });
            }
        });

        // Validar que todas las rutas tengan al menos un endpoint o subruta
        routes.forEach(route => {
            const hasEndpoints = route.endpoints && route.endpoints.length > 0;
            const hasSubRoutes = route.subRoutes && route.subRoutes.length > 0;
            
            if (!hasEndpoints && !hasSubRoutes) {
                const routePath = getFullRoutePath(route);
                const routeName = route.name || routePath;
                errors.push({
                    type: 'empty-route',
                    message: `Ruta vacía "${routeName}" (${routePath}) - debe contener al menos un endpoint o subruta`
                });
            }
        });

        // Validar que las rutas anidadas tengan al menos un endpoint
        routes.forEach(route => {
            if (route.parentRoute) { // Es una ruta anidada
                const hasEndpoints = route.endpoints && route.endpoints.length > 0;
                
                if (!hasEndpoints) {
                    const routePath = getFullRoutePath(route);
                    const routeName = route.name || routePath;
                    errors.push({
                        type: 'nested-route-no-endpoint',
                        message: `Ruta anidada "${routeName}" (${routePath}) - debe contener al menos un endpoint`
                    });
                }
            }
        });

        return errors;
    };

    const showTutorial = () => {
        setTutorialStep(0);
        setShowTutorialModal(true);
    };

    const closeTutorial = () => {
        setShowTutorialModal(false);
        setTutorialStep(0);
    };

    const nextTutorialStep = () => {
        if (tutorialStep < 5) {
            setTutorialStep(tutorialStep + 1);
        } else {
            closeTutorial();
        }
    };

    const prevTutorialStep = () => {
        if (tutorialStep > 0) {
            setTutorialStep(tutorialStep - 1);
        }
    };

    const tutorialContent = [
        // Paso 0: Bienvenida
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
        // Paso 1: Configuración inicial
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
        // Paso 2: Componentes
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
        // Paso 3: Drag and Drop
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
        // Paso 4: Configurar Endpoints
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
        // Paso 5: Generar código
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

    const handleExportCode = async () => {
        // Validar nombre de la API
        if (!apiConfig.name || apiConfig.name.trim() === '') {
            await Swal.fire({
                icon: 'warning',
                title: 'Nombre requerido',
                html: `
                    <div style="text-align: center; padding: 10px;">
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <p style="color: #92400e; font-size: 14px; margin: 0;">
                                Debes especificar un nombre para tu API en la configuración.
                            </p>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#f59e0b',
                backdrop: `
                    rgba(0,0,0,0.6)
                    left top
                    no-repeat
                `,
                customClass: {
                    container: 'blur-backdrop'
                }
            });
            return;
        }

        // Validar puerto (debe ser numérico y válido)
        const portNum = parseInt(apiConfig.port);
        if (!apiConfig.port || isNaN(portNum) || portNum < 1 || portNum > 65535) {
            await Swal.fire({
                icon: 'warning',
                title: 'Puerto inválido',
                html: `
                    <div style="text-align: center; padding: 10px;">
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <p style="color: #92400e; font-size: 14px; margin: 0;">
                                El puerto debe ser un número válido entre <strong>1</strong> y <strong>65535</strong>.
                            </p>
                            <p style="color: #92400e; font-size: 13px; margin-top: 8px; margin-bottom: 0;">
                                Puertos comunes: 3000, 8080, 4000, 5000
                            </p>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#f59e0b',
                backdrop: `
                    rgba(0,0,0,0.6)
                    left top
                    no-repeat
                `,
                customClass: {
                    container: 'blur-backdrop'
                }
            });
            return;
        }

        // Validar si hay componentes
        if (components.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'No hay componentes',
                text: 'Agrega rutas y endpoints antes de generar el código',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        // Validar duplicados
        const errors = validateDuplicates();
        if (errors.length > 0) {
            const errorList = errors.map(e => `- ${e.message}`).join('\n');
            await Swal.fire({
                icon: 'error',
                title: 'Errores de Validación',
                html: `<div style="text-align: left; font-size: 14px;">
                    <p style="margin-bottom: 10px;">Se encontraron los siguientes problemas:</p>
                    <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; max-height: 300px; overflow-y: auto;">${errorList}</pre>
                </div>`,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        // PASO 1: Abrir el modal de configuración
        setTempUseEnv(useEnvironmentVariables);
        setTempUseDb(databaseConfig.enabled);
        setTempDbType(databaseConfig.type);
        setShowCodeGenModal(true);
    };

    // Función para continuar desde el modal de configuración
    const handleContinueFromConfig = () => {
        // Guardar configuraciones temporales
        setUseEnvironmentVariables(tempUseEnv);
        setDatabaseConfig({ enabled: tempUseDb, type: tempDbType });
        
        // Cerrar modal de config y abrir resumen
        setShowCodeGenModal(false);
        setShowConfigSummary(true);
    };

    // Función para generar y copiar el código
    const handleGenerateAndCopy = async () => {
        const useEnv = tempUseEnv;
        const useDb = tempUseDb;
        const dbType = tempDbType;

        // Cerrar modal de resumen
        setShowConfigSummary(false);

        // Generar el código
        const code = generateAPICode(components, apiConfig, useEnv, { enabled: useDb, type: dbType }, getFullPath);
        const envContent = generateEnvFile(useEnv, { enabled: useDb, type: dbType });
        
        // Calcular estadísticas
        const endpointCount = components.filter(c => c.type === 'endpoint').length;
        
        // Copiar código al portapapeles
        try {
            await navigator.clipboard.writeText(code);
            
            // Descargar archivo .env si hay contenido
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
                        <div style="display: flex; align-items: center;">
                            <svg style="width: 20px; height: 20px; color: #3b82f6; margin-right: 8px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                            </svg>
                            <p style="margin: 0; color: #1e40af; font-size: 13px;">
                                Base de datos ${dbType.toUpperCase()} configurada<br/>
                                Completa las credenciales en el archivo .env descargado
                            </p>
                        </div>
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

    const handleClearAll = async () => {
        if (components.length === 0) {
            await Swal.fire({
                icon: 'info',
                title: 'Área vacía',
                text: 'No hay componentes para limpiar',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Eliminar Todo',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p style="margin-bottom: 15px; color: #6b7280;">Esta acción eliminará:</p>
                    <div style="background: #fef2f2; padding: 12px; border-radius: 8px; border-left: 4px solid #ef4444;">
                        <p style="margin: 6px 0; font-size: 14px;">${components.filter(c => c.type === 'route').length} rutas</p>
                        <p style="margin: 6px 0; font-size: 14px;">${components.filter(c => c.type === 'endpoint').length} endpoints</p>
                        <p style="margin: 6px 0; font-size: 14px;">Toda la configuración actual</p>
                    </div>
                    <p style="margin-top: 15px; color: #dc2626; font-weight: 500; font-size: 14px;">Esta acción no se puede deshacer</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar todo',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            setComponents([]);
            setSelectedComponent(null);
            await Swal.fire({
                icon: 'success',
                title: 'Área Limpiada',
                text: 'Todos los componentes han sido eliminados',
                confirmButtonColor: '#10b981',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };



    const renderParameterSection = (component) => {
        return (
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo de Parámetros
                    </label>
                    <select
                        value={component.parameterType}
                        onChange={(e) => updateComponent(component.id, { parameterType: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {parameterTypes.map(param => (
                            <option key={param.value} value={param.value}>
                                {param.label}
                            </option>
                        ))}
                    </select>
                </div>

                {component.parameterType !== 'none' && (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            {component.parameterType === 'route' ? 'Route Parameters' :
                             component.parameterType === 'query' ? 'Query Parameters' :
                             component.parameterType === 'body' ? 'Body Parameters' :
                             'Headers'}
                        </label>
                        
                        {/* Input para agregar parámetros */}
                        <div className="mb-2">
                            <input
                                type="text"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addParameter(component.id, component.parameterType, e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder={`Presiona Enter para agregar - Ej: ${
                                    component.parameterType === 'route' ? 'id, userId' : 
                                    component.parameterType === 'query' ? 'page, limit, search' :
                                    component.parameterType === 'body' ? 'name, email, password' :
                                    'authorization, content-type'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                spellCheck={false}
                            />
                        </div>
                        
                        {/* Etiquetas de parámetros */}
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-200 rounded-md bg-gray-50">
                            {(() => {
                                const paramKey = {
                                    'route': 'routeParams',
                                    'query': 'queryParams',
                                    'body': 'bodyParams',
                                    'headers': 'headerParams'
                                }[component.parameterType];
                                
                                const params = component[paramKey] || [];
                                
                                if (params.length === 0) {
                                    return (
                                        <span className="text-xs text-gray-400 italic">
                                            No hay parámetros agregados
                                        </span>
                                    );
                                }
                                
                                return params.map((param, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span>{param}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeParameter(component.id, component.parameterType, param);
                                            }}
                                            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                                            title="Eliminar parámetro"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                ));
                            })()}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderEndpoint = (component, isNested = false) => {
        const isSelected = selectedComponent === component.id;
        const isDragging = draggedComponent?.id === component.id;
        const indentLevel = component.level || 0;
        const marginLeft = isNested ? `${20 + (indentLevel * 16)}px` : '0px';
        
        return (
            <div
                key={component.id}
                draggable={true}
                onDragStart={(e) => handleComponentDragStart(e, component)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg border-2 shadow-lg transition-all mb-3 ${
                    isSelected ? 'border-green-500 shadow-green-200' : 'border-gray-200'
                } ${
                    isDragging ? 'opacity-50' : 'cursor-move'
                }`}
                style={{ marginLeft }}
                onClick={(e) => handleComponentClick(component, e)}
            >
                <div className="p-3 bg-green-50 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Move className="text-green-400 cursor-grab" size={16} />
                        <Zap className="text-green-600" size={18} />
                        <select
                            value={component.method}
                            onChange={(e) => updateComponent(component.id, { method: e.target.value })}
                            className={`${getMethodColor(component.method)} px-3 py-1.5 rounded-md font-semibold text-xs border outline-none cursor-pointer hover:opacity-80 transition-all`}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='currentColor' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                paddingRight: '28px',
                                appearance: 'none'
                            }}
                        >
                            {httpMethods.map((method) => (
                                <option 
                                    key={method} 
                                    value={method}
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#374151'
                                    }}
                                >
                                    {method}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={component.path}
                            onChange={(e) => updateComponent(component.id, { path: e.target.value })}
                            className="font-mono text-xs bg-transparent border-none outline-none text-gray-700 flex-1 min-w-0"
                            placeholder="/endpoint"
                            onClick={(e) => e.stopPropagation()}
                            spellCheck={false}
                        />
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                            {getFullPath(component)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(component.id);
                            }}
                            className="text-green-600 hover:bg-green-100 p-1 rounded"
                        >
                            {component.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {isSelected && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteComponent(component.id);
                                }}
                                className="text-red-500 hover:bg-red-100 p-1 rounded"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {component.expanded && (
                    <div className="p-3 space-y-3">
                        {renderParameterSection(component)}

                        {/* Constructor de Respuesta Exitosa */}
                        <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                            <label className="block text-xs font-semibold text-green-800 mb-2 flex items-center">
                                Respuesta Exitosa
                            </label>

                            {/* Código de Estado */}
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Código de Estado HTTP
                                </label>
                                <select
                                    value={component.successResponse?.statusCode || 200}
                                    onChange={(e) => updateStatusCode(component.id, 'success', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="200">200 - OK</option>
                                    <option value="201">201 - Created</option>
                                    <option value="202">202 - Accepted</option>
                                    <option value="204">204 - No Content</option>
                                </select>
                            </div>

                            {/* Agregar Campo */}
                            <div className="mb-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Agregar Campo a la Respuesta
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Clave (ej: message)"
                                        id={`success-key-${component.id}`}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                                        onClick={(e) => e.stopPropagation()}
                                        spellCheck={false}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Valor (ej: Success)"
                                        id={`success-value-${component.id}`}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                                        onClick={(e) => e.stopPropagation()}
                                        spellCheck={false}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const keyInput = document.getElementById(`success-key-${component.id}`);
                                                const valueInput = e.target;
                                                addResponseField(component.id, 'success', keyInput.value, valueInput.value);
                                                keyInput.value = '';
                                                valueInput.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const keyInput = document.getElementById(`success-key-${component.id}`);
                                            const valueInput = document.getElementById(`success-value-${component.id}`);
                                            addResponseField(component.id, 'success', keyInput.value, valueInput.value);
                                            keyInput.value = '';
                                            valueInput.value = '';
                                        }}
                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200 transition-colors border border-green-200"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Campos de Respuesta - Estilo Compacto */}
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {(component.successResponse?.fields || []).map((field, index) => (
                                    <div key={index} className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 group">
                                        <span className="text-xs font-semibold text-green-700">
                                            {field.key}:
                                        </span>
                                        <input
                                            type="text"
                                            value={field.value}
                                            onChange={(e) => updateResponseField(component.id, 'success', field.key, e.target.value)}
                                            className="bg-transparent text-xs text-green-800 outline-none border-none min-w-[60px] max-w-[300px]"
                                            onClick={(e) => e.stopPropagation()}
                                            spellCheck={false}
                                            placeholder="valor"
                                            style={{
                                                width: `${Math.max(60, (field.value.length * 7) + 10)}px`
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeResponseField(component.id, 'success', field.key);
                                            }}
                                            className="text-green-600 hover:text-red-600 hover:bg-red-100 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Constructor de Respuesta de Error */}
                        <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                            <label className="block text-xs font-semibold text-red-800 mb-2 flex items-center">
                                Respuesta de Error
                            </label>
                            
                            {/* Código de Estado */}
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Código de Estado HTTP
                                </label>
                                <select
                                    value={component.errorResponse?.statusCode || 500}
                                    onChange={(e) => updateStatusCode(component.id, 'error', e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <option value="400">400 - Bad Request</option>
                                    <option value="401">401 - Unauthorized</option>
                                    <option value="403">403 - Forbidden</option>
                                    <option value="404">404 - Not Found</option>
                                    <option value="409">409 - Conflict</option>
                                    <option value="422">422 - Unprocessable Entity</option>
                                    <option value="500">500 - Internal Server Error</option>
                                    <option value="503">503 - Service Unavailable</option>
                                </select>
                            </div>

                            {/* Agregar Campo */}
                            <div className="mb-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Agregar Campo a la Respuesta
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Clave"
                                        id={`error-key-${component.id}`}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                                        onClick={(e) => e.stopPropagation()}
                                        spellCheck={false}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Valor"
                                        id={`error-value-${component.id}`}
                                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                                        onClick={(e) => e.stopPropagation()}
                                        spellCheck={false}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const keyInput = document.getElementById(`error-key-${component.id}`);
                                                const valueInput = e.target;
                                                addResponseField(component.id, 'error', keyInput.value, valueInput.value);
                                                keyInput.value = '';
                                                valueInput.value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const keyInput = document.getElementById(`error-key-${component.id}`);
                                            const valueInput = document.getElementById(`error-value-${component.id}`);
                                            addResponseField(component.id, 'error', keyInput.value, valueInput.value);
                                            keyInput.value = '';
                                            valueInput.value = '';
                                        }}
                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition-colors border border-red-200"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Campos de Respuesta - Estilo Compacto */}
                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {(component.errorResponse?.fields || []).map((field, index) => (
                                    <div key={index} className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 group">
                                        <span className="text-xs font-semibold text-red-700">
                                            {field.key}:
                                        </span>
                                        <input
                                            type="text"
                                            value={field.value}
                                            onChange={(e) => updateResponseField(component.id, 'error', field.key, e.target.value)}
                                            className="bg-transparent text-xs text-red-800 outline-none border-none min-w-[60px] max-w-[300px]"
                                            onClick={(e) => e.stopPropagation()}
                                            spellCheck={false}
                                            placeholder="valor"
                                            style={{
                                                width: `${Math.max(60, (field.value.length * 7) + 10)}px`
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeResponseField(component.id, 'error', field.key);
                                            }}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-100 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderRoute = (component) => {
        const isSelected = selectedComponent === component.id;
        const isDragging = draggedComponent?.id === component.id;
        const nestedEndpoints = components.filter(c => c.parentRoute === component.id && c.type === 'endpoint');
        const nestedRoutes = components.filter(c => c.parentRoute === component.id && c.type === 'route');
        const indentLevel = component.level || 0;
        const marginLeft = component.parentRoute ? `${20 + ((indentLevel - 1) * 16)}px` : '0px';
        
        return (
            <div key={component.id} style={{ marginLeft }}>
                <div
                    draggable={true}
                    onDragStart={(e) => handleComponentDragStart(e, component)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg border-2 shadow-lg mb-4 transition-all ${
                        isSelected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200'
                    } ${
                        isDragOver === component.id
                        ? 'border-purple-400 shadow-purple-200 bg-purple-50' 
                        : ''
                    } ${
                        isDragging ? 'opacity-50' : 'cursor-move'
                    }`}
                    onClick={(e) => handleComponentClick(component, e)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleRouteDragEnter(e, component.id)}
                    onDragLeave={(e) => handleRouteDragLeave(e, component.id)}
                    onDrop={(e) => handleRouteDrop(e, component.id)}
                >
                    <div className="p-4 bg-blue-50 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                            <Move className="text-blue-400 cursor-grab" size={16} />
                            <Route className="text-blue-600" size={20} />
                            <input
                                type="text"
                                value={component.name}
                                onChange={(e) => updateComponent(component.id, { name: e.target.value })}
                                className="font-semibold text-blue-800 bg-transparent border-none outline-none flex-1"
                                placeholder="Nombre de la ruta"
                                onClick={(e) => e.stopPropagation()}
                                spellCheck={false}
                            />
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {nestedEndpoints.length}E • {nestedRoutes.length}R
                            </span>
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                {getFullRoutePath(component)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(component.id);
                                }}
                                className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                            >
                                {component.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {isSelected && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteComponent(component.id);
                                    }}
                                    className="text-red-500 hover:bg-red-100 p-1 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {component.expanded && (
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ruta Base</label>
                                <input
                                    type="text"
                                    value={component.basePath}
                                    onChange={(e) => updateComponent(component.id, { basePath: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="/api"
                                    onClick={(e) => e.stopPropagation()}
                                    spellCheck={false}
                                />
                            </div>
                            
                            {(nestedEndpoints.length === 0 && nestedRoutes.length === 0) ? (
                                <div className={`text-center py-8 border-2 border-dashed rounded-lg transition-all ${
                                    isDragOver === component.id
                                    ? 'border-purple-400 bg-purple-50 text-purple-600'
                                    : 'border-gray-300 text-gray-500'
                                }`}>
                                    <div className="flex justify-center space-x-4 mb-2">
                                        <Zap size={24} className="opacity-50" />
                                        <Route size={24} className="opacity-50" />
                                    </div>
                                    <p className="text-sm">
                                        {isDragOver === component.id
                                            ? 'Suelta aquí'
                                            : 'Arrastra endpoints o subrutas aquí'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {nestedRoutes.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Subrutas:</h4>
                                            {nestedRoutes.map(route => renderRoute(route))}
                                        </div>
                                    )}

                                    {nestedEndpoints.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Endpoints:</h4>
                                            {nestedEndpoints.map(endpoint => renderEndpoint(endpoint, true))}
                                        </div>
                                    )}

                                    {isDragOver === component.id && (
                                        <div className="mb-2 border-2 border-dashed border-purple-400 bg-purple-50 rounded-lg p-4 text-center text-purple-600 text-sm">
                                            Suelta aquí
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderComponent = (component) => {
        if (component.parentRoute) {
            return null;
        }

        if (component.type === 'route') {
            return renderRoute(component);
        }

        return renderEndpoint(component);
    };

    const routeCount = components.filter(c => c.type === 'route').length;
    const endpointCount = components.filter(c => c.type === 'endpoint').length;
    const nestedEndpointCount = components.filter(c => c.type === 'endpoint' && c.parentRoute).length;
    const independentEndpointCount = endpointCount - nestedEndpointCount;

    // Pasos del tutorial
    const helpSteps = [
        {
            title: "Bienvenido a GenAPI",
            icon: Globe,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">GenAPI es una herramienta visual para crear APIs de manera rápida y sencilla.</p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">¿Qué puedes hacer?</h4>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• Crear rutas y endpoints con drag & drop</li>
                            <li>• Configurar parámetros y respuestas</li>
                            <li>• Generar código listo para usar</li>
                            <li>• Conectar con bases de datos</li>
                            <li>• Usar variables de entorno</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "1. Configuración Básica",
            icon: Server,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Comienza configurando los datos básicos de tu API:</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                        <div>
                            <span className="font-semibold text-gray-800">Nombre:</span>
                            <p className="text-sm text-gray-600">El nombre de tu API (ej: "Mi API REST")</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-800">Puerto:</span>
                            <p className="text-sm text-gray-600">Puerto donde correrá el servidor (ej: 3000)</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-800">Descripción:</span>
                            <p className="text-sm text-gray-600">Descripción breve de tu API</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "2. Variables de Entorno",
            icon: Settings,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Las variables de entorno protegen información sensible:</p>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">¿Por qué usarlas?</h4>
                        <ul className="text-sm text-purple-800 space-y-2">
                            <li className="flex items-center"><Lock size={16} className="mr-2 flex-shrink-0" /> No expones credenciales en el código</li>
                            <li className="flex items-center"><RefreshCw size={16} className="mr-2 flex-shrink-0" /> Diferentes configuraciones por ambiente</li>
                            <li className="flex items-center"><CheckCircle size={16} className="mr-2 flex-shrink-0" /> Mejores prácticas de seguridad</li>
                        </ul>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Recomendado:</strong> Mantén esta opción activada
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "3. Base de Datos",
            icon: Server,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Conecta tu API con una base de datos:</p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Tipos soportados:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                            <div>• MySQL</div>
                            <div>• Oracle SQL</div>
                            <div>• PostgreSQL</div>
                            <div>• MS SQL Server</div>
                            <div>• MongoDB</div>
                            <div>• Redis</div>
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                            <strong>Automático:</strong> Se generará un archivo .env con las variables necesarias
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "4. Crear Rutas",
            icon: Route,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Las rutas organizan tus endpoints:</p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <div>
                            <span className="font-semibold text-blue-900">1. Arrastra la tarjeta "Ruta"</span>
                            <p className="text-sm text-blue-800">Desde el panel lateral al área principal</p>
                        </div>
                        <div>
                            <span className="font-semibold text-blue-900">2. Configura el path</span>
                            <p className="text-sm text-blue-800">Ejemplo: /api, /users, /productos</p>
                        </div>
                        <div>
                            <span className="font-semibold text-blue-900">3. Anida rutas</span>
                            <p className="text-sm text-blue-800">Arrastra una ruta dentro de otra para crear subrutas</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "5. Crear Endpoints",
            icon: Zap,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Los endpoints definen las operaciones de tu API:</p>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                        <div>
                            <span className="font-semibold text-green-900">1. Arrastra "Endpoint"</span>
                            <p className="text-sm text-green-800">Al área principal o dentro de una ruta</p>
                        </div>
                        <div>
                            <span className="font-semibold text-green-900">2. Selecciona el método HTTP</span>
                            <p className="text-sm text-green-800">GET, POST, PUT, DELETE, PATCH</p>
                        </div>
                        <div>
                            <span className="font-semibold text-green-900">3. Define el path</span>
                            <p className="text-sm text-green-800">Ejemplo: /users, /products/:id</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "6. Configurar Parámetros",
            icon: Hash,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Cada endpoint puede recibir diferentes tipos de parámetros:</p>
                    <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <strong className="text-blue-900">Route Params:</strong>
                            <p className="text-sm text-blue-800">Parámetros en la URL (ej: /users/:id)</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                            <strong className="text-green-900">Query Params:</strong>
                            <p className="text-sm text-green-800">Parámetros en la query string (ej: ?page=1&limit=10)</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded border border-purple-200">
                            <strong className="text-purple-900">Body:</strong>
                            <p className="text-sm text-purple-800">Datos en el cuerpo de la petición (POST, PUT)</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <strong className="text-yellow-900">Headers:</strong>
                            <p className="text-sm text-yellow-800">Encabezados HTTP personalizados</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "7. Respuestas",
            icon: FileText,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Define las respuestas de éxito y error para cada endpoint:</p>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
                        <h4 className="font-semibold text-green-900">Respuesta de Éxito</h4>
                        <p className="text-sm text-green-800">Define el código de estado (200, 201, etc.)</p>
                        <p className="text-sm text-green-800">Agrega campos clave-valor para la respuesta JSON</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-2">
                        <h4 className="font-semibold text-red-900">Respuesta de Error</h4>
                        <p className="text-sm text-red-800">Define el código de estado (400, 404, 500, etc.)</p>
                        <p className="text-sm text-red-800">Agrega campos para el mensaje de error</p>
                    </div>
                </div>
            )
        },
        {
            title: "8. Reorganizar Componentes",
            icon: Move,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Puedes mover componentes existentes arrastrándolos:</p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <div>
                            <span className="font-semibold text-blue-900">Mover al área principal:</span>
                            <p className="text-sm text-blue-800">Arrastra un componente al fondo vacío</p>
                        </div>
                        <div>
                            <span className="font-semibold text-blue-900">Anidar en una ruta:</span>
                            <p className="text-sm text-blue-800">Arrastra un componente sobre una ruta existente</p>
                        </div>
                        <div>
                            <span className="font-semibold text-blue-900">Reorganizar:</span>
                            <p className="text-sm text-blue-800">Los paths se actualizan automáticamente</p>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                            <strong>Tip:</strong> No puedes crear anidación circular (una ruta dentro de su propia subruta)
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "9. Generar Código",
            icon: Download,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Cuando termines de diseñar tu API:</p>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                        <div>
                            <span className="font-semibold text-purple-900">1. Click en "Generar Código"</span>
                            <p className="text-sm text-purple-800">Se validará tu configuración</p>
                        </div>
                        <div>
                            <span className="font-semibold text-purple-900">2. Revisa las especificaciones</span>
                            <p className="text-sm text-purple-800">Verifica rutas, endpoints y dependencias</p>
                        </div>
                        <div>
                            <span className="font-semibold text-purple-900">3. Descarga los archivos</span>
                            <p className="text-sm text-purple-800">Código copiado al portapapeles + archivo .env</p>
                        </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                        <p className="text-sm text-green-800">
                            <strong>Resultado:</strong> Código Express.js listo para ejecutar
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "10. Instalar y Ejecutar",
            icon: Code,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">Pasos finales para ejecutar tu API:</p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm space-y-2">
                        <div className="text-green-400"># 1. Crear proyecto</div>
                        <div>$ mkdir mi-api && cd mi-api</div>
                        <div className="text-green-400 mt-3"># 2. Inicializar npm</div>
                        <div>$ npm init -y</div>
                        <div className="text-green-400 mt-3"># 3. Instalar dependencias</div>
                        <div>$ npm install express dotenv mysql2</div>
                        <div className="text-green-400 mt-3"># 4. Crear server.js</div>
                        <div className="text-gray-400"># Pega el código generado</div>
                        <div className="text-green-400 mt-3"># 5. Configurar .env</div>
                        <div className="text-gray-400"># Completa las credenciales</div>
                        <div className="text-green-400 mt-3"># 6. Ejecutar</div>
                        <div>$ node server.js</div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <>
            <style>{`
                .blur-backdrop {
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }
                
                /* Asegurar que el backdrop tenga el efecto blur */
                .swal2-container.blur-backdrop {
                    background: rgba(0, 0, 0, 0.6) !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                }
                
                /* Animación para el modal */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
            <div className="flex h-screen bg-gray-100">
            <Sidebar
                apiConfig={apiConfig}
                setApiConfig={setApiConfig}
                componentTypes={componentTypes}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleExportCode={handleExportCode}
                handleClearAll={handleClearAll}
                routeCount={routeCount}
                endpointCount={endpointCount}
                nestedEndpointCount={nestedEndpointCount}
                independentEndpointCount={independentEndpointCount}
            />

            <div className="flex-1 flex flex-col">
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
                                onClick={showTutorial}
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

                <div
                    className={`flex-1 p-6 overflow-auto transition-colors ${
                        isDragOver === 'main' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleMainAreaDragEnter}
                    onDragLeave={handleMainAreaDragLeave}
                    onDrop={handleMainDrop}
                    onClick={handleCanvasClick}
                >
                    {components.filter(c => !c.parentRoute).length === 0 ? (
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
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            {components.map(renderComponent)}
                            
                            {isDragOver === 'main' && (
                                <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-8 text-center text-blue-600 mt-4">
                                    <p className="text-lg font-medium">Suelta aquí</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <TutorialModal
            showTutorialModal={showTutorialModal}
            tutorialStep={tutorialStep}
            tutorialContent={tutorialContent}
            closeTutorial={closeTutorial}
            prevTutorialStep={prevTutorialStep}
            nextTutorialStep={nextTutorialStep}
        />

        <CodeGenModal
            showCodeGenModal={showCodeGenModal}
            tempUseEnv={tempUseEnv}
            setTempUseEnv={setTempUseEnv}
            tempUseDb={tempUseDb}
            setTempUseDb={setTempUseDb}
            tempDbType={tempDbType}
            setTempDbType={setTempDbType}
            setShowCodeGenModal={setShowCodeGenModal}
            handleContinueFromConfig={handleContinueFromConfig}
        />


        <ConfigSummaryModal
            showConfigSummary={showConfigSummary}
            apiConfig={apiConfig}
            tempUseEnv={tempUseEnv}
            tempUseDb={tempUseDb}
            setShowConfigSummary={setShowConfigSummary}
            setShowCodeGenModal={setShowCodeGenModal}
            handleGenerateAndCopy={handleGenerateAndCopy}
        />
        </>
    );
}