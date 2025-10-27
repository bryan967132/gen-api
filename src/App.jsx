import React, { useState, useRef, useEffect } from 'react';
import { Route, Zap, Code, Settings, Download, Trash2, ChevronDown, ChevronUp, Move, Server, Globe, Hash, FileText, User, Search, HelpCircle, X, ChevronLeft, ChevronRight, Lock, RefreshCw, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

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
    
    // Nueva configuración para variables de entorno y base de datos
    const [useEnvironmentVariables, setUseEnvironmentVariables] = useState(true);
    const [databaseConfig, setDatabaseConfig] = useState({
        enabled: false,
        type: 'mysql' // mysql, oracle, postgresql, mssql, mongodb, redis
    });
    
    // Estado para módulo de ayuda
    const [showHelp, setShowHelp] = useState(false);
    const [helpStep, setHelpStep] = useState(0);

    // Cerrar modal con tecla ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && showHelp) {
                setShowHelp(false);
                setHelpStep(0);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showHelp]);

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

    const handleExportCode = async () => {
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

        // Calcular estadísticas
        const routeCount = components.filter(c => c.type === 'route').length;
        const endpointCount = components.filter(c => c.type === 'endpoint').length;
        const totalRoutes = new Set(components.filter(c => c.type === 'endpoint').map(e => getFullPath(e).split('/').slice(0, -1).join('/'))).size;
        
        // Determinar paquetes npm necesarios
        let npmPackages = 'express';
        if (useEnvironmentVariables || databaseConfig.enabled) {
            npmPackages += ' dotenv';
        }
        if (databaseConfig.enabled) {
            if (databaseConfig.type === 'mysql') npmPackages += ' mysql2';
            else if (databaseConfig.type === 'oracle') npmPackages += ' oracledb';
            else if (databaseConfig.type === 'postgresql') npmPackages += ' pg';
            else if (databaseConfig.type === 'mssql') npmPackages += ' mssql';
            else if (databaseConfig.type === 'mongodb') npmPackages += ' mongodb';
            else if (databaseConfig.type === 'redis') npmPackages += ' redis';
        }

        // Mostrar modal de confirmación con especificaciones
        const result = await Swal.fire({
            title: 'Generar Código de la API',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <h3 style="color: #1f2937; margin-bottom: 12px; font-size: 16px;">Especificaciones:</h3>
                    <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Nombre:</strong> ${apiConfig.name}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Puerto:</strong> ${apiConfig.port}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Descripción:</strong> ${apiConfig.description || 'Sin descripción'}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Total de rutas:</strong> ${routeCount}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Total de endpoints:</strong> ${endpointCount}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Variables de entorno:</strong> ${useEnvironmentVariables ? 'Habilitadas' : 'Deshabilitadas'}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>Base de datos:</strong> ${databaseConfig.enabled ? `${databaseConfig.type.toUpperCase()}` : 'Sin base de datos'}</p>
                    </div>
                    
                    <h3 style="color: #1f2937; margin-bottom: 12px; font-size: 16px;">Estructura de Proyecto:</h3>
                    <div style="background: #1f2937; color: #10b981; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6;">
                        <div>mi-api/</div>
                        <div>├── node_modules/</div>
                        ${(useEnvironmentVariables || databaseConfig.enabled) ? '<div>├── .env                <span style="color: #f59e0b;">← Se generará</span></div>' : ''}
                        <div>├── package.json</div>
                        <div>├── server.js          <span style="color: #6b7280;">← Código generado</span></div>
                        <div>└── README.md</div>
                    </div>
                    
                    <h3 style="color: #1f2937; margin: 15px 0 12px 0; font-size: 16px;">Instalación:</h3>
                    <div style="background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px;">
                        <div>$ npm install ${npmPackages}</div>
                        ${(useEnvironmentVariables || databaseConfig.enabled) ? '<div style="color: #f59e0b;">$ # Configurar archivo .env generado</div>' : ''}
                        <div>$ node server.js</div>
                    </div>
                    
                    ${(useEnvironmentVariables || databaseConfig.enabled) ? `
                        <div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 500;">
                                ⚠️ Se generará el archivo <strong>.env</strong> que deberás completar con tus credenciales
                            </p>
                        </div>
                    ` : ''}
                    
                    <p style="margin-top: 15px; color: #6b7280; font-size: 13px;">
                        El código será copiado al portapapeles<br/>
                        Framework: Express.js<br/>
                        Listo para ejecutar
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Generar y Copiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            width: '600px'
        });

        if (result.isConfirmed) {
            const code = generateAPICode();
            const envContent = generateEnvFile();
            
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
                            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600;">📄 Archivo .env generado</h4>
                            <p style="margin: 0; color: #92400e; font-size: 13px;">
                                El archivo <strong>.env</strong> ha sido descargado.<br/>
                                Completa los valores de las variables antes de ejecutar tu API.
                            </p>
                        </div>
                    `;
                }
                
                if (databaseConfig.enabled) {
                    successMessage += `
                        <div style="margin-top: 15px; padding: 12px; background: #dbeafe; border-radius: 6px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; color: #1e40af; font-size: 13px;">
                                🗄️ Base de datos ${databaseConfig.type.toUpperCase()} configurada<br/>
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
                    width: '650px'
                });
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error al copiar',
                    text: 'No se pudo copiar al portapapeles. Intenta manualmente.',
                    confirmButtonColor: '#ef4444'
                });
            }
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

    const generateDatabaseConnector = () => {
        if (!databaseConfig.enabled) return '';
        
        const { type } = databaseConfig;
        let code = '';
        
        if (type === 'mysql') {
            code += `\n// MySQL Database Connection\n`;
            code += `const mysql = require('mysql2/promise');\n\n`;
            code += `const pool = mysql.createPool({\n`;
            code += `  host: process.env.DB_HOST,\n`;
            code += `  port: process.env.DB_PORT,\n`;
            code += `  database: process.env.DB_DATABASE,\n`;
            code += `  user: process.env.DB_USER,\n`;
            code += `  password: process.env.DB_PASSWORD,\n`;
            code += `  waitForConnections: true,\n`;
            code += `  connectionLimit: 10,\n`;
            code += `  queueLimit: 0\n`;
            code += `});\n\n`;
            code += `// Test database connection\n`;
            code += `pool.getConnection()\n`;
            code += `  .then(connection => {\n`;
            code += `    console.log('[SUCCESS] MySQL Database connected successfully');\n`;
            code += `    connection.release();\n`;
            code += `  })\n`;
            code += `  .catch(err => {\n`;
            code += `    console.error('[ERROR] MySQL Database connection failed:', err.message);\n`;
            code += `  });\n\n`;
            
        } else if (type === 'oracle') {
            code += `\n// Oracle SQL Database Connection\n`;
            code += `const oracledb = require('oracledb');\n\n`;
            code += `oracledb.autoCommit = true;\n\n`;
            code += `async function initializeDatabase() {\n`;
            code += `  try {\n`;
            code += `    await oracledb.createPool({\n`;
            code += `      user: process.env.DB_USER,\n`;
            code += `      password: process.env.DB_PASSWORD,\n`;
            code += `      connectString: process.env.DB_CONNECTION_STRING,\n`;
            code += `      poolMin: 2,\n`;
            code += `      poolMax: 10,\n`;
            code += `      poolIncrement: 1\n`;
            code += `    });\n`;
            code += `    console.log('[SUCCESS] Oracle Database connected successfully');\n`;
            code += `  } catch (err) {\n`;
            code += `    console.error('[ERROR] Oracle Database connection failed:', err.message);\n`;
            code += `  }\n`;
            code += `}\n\n`;
            code += `initializeDatabase();\n\n`;
            
        } else if (type === 'postgresql') {
            code += `\n// PostgreSQL Database Connection\n`;
            code += `const { Pool } = require('pg');\n\n`;
            code += `const pool = new Pool({\n`;
            code += `  host: process.env.DB_HOST,\n`;
            code += `  port: process.env.DB_PORT,\n`;
            code += `  database: process.env.DB_DATABASE,\n`;
            code += `  user: process.env.DB_USER,\n`;
            code += `  password: process.env.DB_PASSWORD,\n`;
            code += `  max: 10,\n`;
            code += `  idleTimeoutMillis: 30000\n`;
            code += `});\n\n`;
            code += `// Test database connection\n`;
            code += `pool.connect()\n`;
            code += `  .then(client => {\n`;
            code += `    console.log('[SUCCESS] PostgreSQL Database connected successfully');\n`;
            code += `    client.release();\n`;
            code += `  })\n`;
            code += `  .catch(err => {\n`;
            code += `    console.error('[ERROR] PostgreSQL Database connection failed:', err.message);\n`;
            code += `  });\n\n`;
            
        } else if (type === 'mssql') {
            code += `\n// Microsoft SQL Server Database Connection\n`;
            code += `const sql = require('mssql');\n\n`;
            code += `const sqlConfig = {\n`;
            code += `  user: process.env.DB_USER,\n`;
            code += `  password: process.env.DB_PASSWORD,\n`;
            code += `  database: process.env.DB_DATABASE,\n`;
            code += `  server: process.env.DB_HOST,\n`;
            code += `  port: parseInt(process.env.DB_PORT),\n`;
            code += `  pool: {\n`;
            code += `    max: 10,\n`;
            code += `    min: 0,\n`;
            code += `    idleTimeoutMillis: 30000\n`;
            code += `  },\n`;
            code += `  options: {\n`;
            code += `    encrypt: true,\n`;
            code += `    trustServerCertificate: true\n`;
            code += `  }\n`;
            code += `};\n\n`;
            code += `// Test database connection\n`;
            code += `sql.connect(sqlConfig)\n`;
            code += `  .then(pool => {\n`;
            code += `    console.log('[SUCCESS] MSSQL Database connected successfully');\n`;
            code += `  })\n`;
            code += `  .catch(err => {\n`;
            code += `    console.error('[ERROR] MSSQL Database connection failed:', err.message);\n`;
            code += `  });\n\n`;
            
        } else if (type === 'mongodb') {
            code += `\n// MongoDB Database Connection\n`;
            code += `const { MongoClient } = require('mongodb');\n\n`;
            code += `const mongoUrl = process.env.MONGO_URL || \`mongodb://\${process.env.DB_USER}:\${process.env.DB_PASSWORD}@\${process.env.DB_HOST}:\${process.env.DB_PORT}/\${process.env.DB_DATABASE}\`;\n`;
            code += `const mongoClient = new MongoClient(mongoUrl);\n\n`;
            code += `let db;\n\n`;
            code += `// Connect to MongoDB\n`;
            code += `mongoClient.connect()\n`;
            code += `  .then(() => {\n`;
            code += `    db = mongoClient.db();\n`;
            code += `    console.log('[SUCCESS] MongoDB Database connected successfully');\n`;
            code += `  })\n`;
            code += `  .catch(err => {\n`;
            code += `    console.error('[ERROR] MongoDB Database connection failed:', err.message);\n`;
            code += `  });\n\n`;
            
        } else if (type === 'redis') {
            code += `\n// Redis Database Connection\n`;
            code += `const redis = require('redis');\n\n`;
            code += `const redisClient = redis.createClient({\n`;
            code += `  host: process.env.REDIS_HOST,\n`;
            code += `  port: process.env.REDIS_PORT,\n`;
            code += `  password: process.env.REDIS_PASSWORD\n`;
            code += `});\n\n`;
            code += `redisClient.on('connect', () => {\n`;
            code += `  console.log('[SUCCESS] Redis Database connected successfully');\n`;
            code += `});\n\n`;
            code += `redisClient.on('error', (err) => {\n`;
            code += `  console.error('[ERROR] Redis Database connection failed:', err.message);\n`;
            code += `});\n\n`;
            code += `redisClient.connect();\n\n`;
        }
        
        return code;
    };
    
    const generateEnvFile = () => {
        let envContent = '';
        
        // Puerto de la API si usa variables de entorno
        if (useEnvironmentVariables) {
            envContent += `# Server Configuration\n`;
            envContent += `PORT=\n\n`;
        }
        
        // Variables de base de datos
        if (databaseConfig.enabled) {
            const { type } = databaseConfig;
            
            envContent += `# Database Configuration\n`;
            
            if (type === 'mysql') {
                envContent += `DB_HOST=\n`;
                envContent += `DB_PORT=\n`;
                envContent += `DB_DATABASE=\n`;
                envContent += `DB_USER=\n`;
                envContent += `DB_PASSWORD=\n`;
            } else if (type === 'oracle') {
                envContent += `DB_USER=\n`;
                envContent += `DB_PASSWORD=\n`;
                envContent += `DB_CONNECTION_STRING=\n`;
            } else if (type === 'postgresql') {
                envContent += `DB_HOST=\n`;
                envContent += `DB_PORT=\n`;
                envContent += `DB_DATABASE=\n`;
                envContent += `DB_USER=\n`;
                envContent += `DB_PASSWORD=\n`;
            } else if (type === 'mssql') {
                envContent += `DB_HOST=\n`;
                envContent += `DB_PORT=\n`;
                envContent += `DB_DATABASE=\n`;
                envContent += `DB_USER=\n`;
                envContent += `DB_PASSWORD=\n`;
            } else if (type === 'mongodb') {
                envContent += `DB_HOST=\n`;
                envContent += `DB_PORT=\n`;
                envContent += `DB_DATABASE=\n`;
                envContent += `DB_USER=\n`;
                envContent += `DB_PASSWORD=\n`;
                envContent += `# O usa una URL completa:\n`;
                envContent += `# MONGO_URL=\n`;
            } else if (type === 'redis') {
                envContent += `REDIS_HOST=\n`;
                envContent += `REDIS_PORT=\n`;
                envContent += `REDIS_PASSWORD=\n`;
            }
        }
        
        return envContent;
    };

    const generateAPICode = () => {
        const endpoints = components.filter(c => c.type === 'endpoint');
        
        let code = `// ${apiConfig.name}\n// ${apiConfig.description}\n\n`;
        
        // Requerir dotenv si se usan variables de entorno O si hay base de datos
        if (useEnvironmentVariables || databaseConfig.enabled) {
            code += `require('dotenv').config();\n`;
        }
        
        code += `const express = require('express');\nconst app = express();\n\n`;
        code += `app.use(express.json());\napp.use(express.urlencoded({ extended: true }));\n`;
        
        // Agregar conector de base de datos
        code += generateDatabaseConnector();
        
        endpoints.forEach(endpoint => {
            const method = endpoint.method.toLowerCase();
            const fullPath = getFullPath(endpoint);

            code += `// ${endpoint.method} ${fullPath}\n`;
            
            // Obtener los parámetros según el tipo
            let params = [];
            switch (endpoint.parameterType) {
                case 'route':
                    params = endpoint.routeParams || [];
                    break;
                case 'query':
                    params = endpoint.queryParams || [];
                    break;
                case 'body':
                    params = endpoint.bodyParams || [];
                    break;
                case 'headers':
                    params = endpoint.headerParams || [];
                    break;
            }
            
            if (endpoint.parameterType !== 'none' && params.length > 0) {
                code += `// Parámetros (${endpoint.parameterType}): ${params.join(', ')}\n`;
            }

            code += `app.${method}('${fullPath}', (req, res) => {\n`;

            if (endpoint.parameterType !== 'none' && params.length > 0) {
                switch (endpoint.parameterType) {
                    case 'route':
                        code += `  // Route params: ${params.join(', ')}\n`;
                        code += `  const routeParams = req.params;\n`;
                        params.forEach(param => {
                            code += `  // const ${param} = req.params.${param};\n`;
                        });
                        break;
                    case 'query':
                        code += `  // Query params: ${params.join(', ')}\n`;
                        code += `  const queryParams = req.query;\n`;
                        params.forEach(param => {
                            code += `  // const ${param} = req.query.${param};\n`;
                        });
                        break;
                    case 'body':
                        code += `  // Body params: ${params.join(', ')}\n`;
                        code += `  const bodyData = req.body;\n`;
                        params.forEach(param => {
                            code += `  // const ${param} = req.body.${param};\n`;
                        });
                        break;
                    case 'headers':
                        code += `  // Headers: ${params.join(', ')}\n`;
                        code += `  const headers = req.headers;\n`;
                        params.forEach(param => {
                            code += `  // const ${param} = req.headers['${param.toLowerCase()}'];\n`;
                        });
                        break;
                }
            }

            code += `  try {\n`;
            
            // Agregar ejemplo de query a base de datos si está habilitado
            if (databaseConfig.enabled) {
                const { type } = databaseConfig;
                code += `    // Ejemplo de consulta a base de datos:\n`;
                
                if (type === 'mysql') {
                    code += `    // const [rows] = await pool.query('SELECT * FROM tabla WHERE id = ?', [id]);\n`;
                } else if (type === 'oracle') {
                    code += `    // const connection = await oracledb.getConnection();\n`;
                    code += `    // const result = await connection.execute('SELECT * FROM tabla WHERE id = :id', [id]);\n`;
                    code += `    // await connection.close();\n`;
                } else if (type === 'postgresql') {
                    code += `    // const result = await pool.query('SELECT * FROM tabla WHERE id = $1', [id]);\n`;
                } else if (type === 'mssql') {
                    code += `    // const result = await sql.query\`SELECT * FROM tabla WHERE id = \${id}\`;\n`;
                } else if (type === 'mongodb') {
                    code += `    // const result = await db.collection('coleccion').find({}).toArray();\n`;
                } else if (type === 'redis') {
                    code += `    // const value = await redisClient.get('key');\n`;
                    code += `    // await redisClient.set('key', 'value');\n`;
                }
                
                code += `\n`;
            }
            
            // Construir respuesta de éxito
            const successResponse = endpoint.successResponse || { statusCode: 200, fields: [] };
            const successObj = {};
            successResponse.fields.forEach(field => {
                successObj[field.key] = field.value;
            });
            code += `    res.status(${successResponse.statusCode}).json(${JSON.stringify(successObj, null, 4).replace(/\n/g, '\n    ')});\n`;
            
            code += `  } catch (error) {\n`;
            
            // Construir respuesta de error
            const errorResponse = endpoint.errorResponse || { statusCode: 500, fields: [] };
            const errorObj = {};
            errorResponse.fields.forEach(field => {
                errorObj[field.key] = field.value;
            });
            code += `    res.status(${errorResponse.statusCode}).json(${JSON.stringify(errorObj, null, 4).replace(/\n/g, '\n    ')});\n`;
            
            code += `  }\n});\n\n`;
        });

        // Puerto desde variable de entorno o hardcoded
        const portValue = useEnvironmentVariables ? 'process.env.PORT || ' + apiConfig.port : apiConfig.port;
        code += `const PORT = ${portValue};\n`;
        code += `app.listen(PORT, () => {\n  console.log('${apiConfig.name} running on port ' + PORT);\n});`;

        return code;
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
        <div className="flex h-screen bg-gray-100">
            {/* Barra lateral */}
            <div className="w-80 bg-white shadow-lg border-r border-gray-200 p-4 flex flex-col overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                    <Code className="mr-2" size={24} />
                    GenAPI
                </h2>
                <p className="text-sm text-gray-600 mb-6">Genera tu API visualmente</p>

                {/* Configuración de la API */}
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
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Puerto</label>
                            <input
                                type="number"
                                value={apiConfig.port}
                                onChange={(e) => setApiConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 3000 }))}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="3000"
                                spellCheck={false}
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

                {/* Configuración Avanzada */}
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h3 className="text-sm font-semibold text-purple-700 mb-3 flex items-center">
                        <Settings size={16} className="mr-1" />
                        Configuración Avanzada
                    </h3>
                    
                    {/* Variables de Entorno */}
                    <div className="mb-4 p-3 bg-white rounded-lg border border-purple-100">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useEnvironmentVariables}
                                onChange={(e) => setUseEnvironmentVariables(e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex-1">
                                <span className="text-xs font-semibold text-gray-700">Usar Variables de Entorno</span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Configura el puerto y credenciales mediante archivo .env
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Configuración de Base de Datos */}
                    <div className="p-3 bg-white rounded-lg border border-purple-100">
                        <label className="flex items-center cursor-pointer mb-3">
                            <input
                                type="checkbox"
                                checked={databaseConfig.enabled}
                                onChange={(e) => setDatabaseConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                                <span className="text-xs font-semibold text-gray-700">Incluir Conector de Base de Datos</span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Genera conexión con variables de entorno (.env)
                                </p>
                            </div>
                        </label>

                        {databaseConfig.enabled && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Base de Datos</label>
                                    <select
                                        value={databaseConfig.type}
                                        onChange={(e) => setDatabaseConfig(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="mysql">MySQL</option>
                                        <option value="oracle">Oracle SQL</option>
                                        <option value="postgresql">PostgreSQL</option>
                                        <option value="mssql">Microsoft SQL Server</option>
                                        <option value="mongodb">MongoDB</option>
                                        <option value="redis">Redis</option>
                                    </select>
                                </div>
                                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 flex items-center">
                                    <Lock size={14} className="mr-2 flex-shrink-0" /> Las credenciales se configurarán mediante archivo .env que se generará automáticamente
                                </div>
                            </div>
                        )}
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

                {/* Estadísticas */}
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

                {/* Instrucciones */}
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

                {/* Acciones */}
                <div className="space-y-3 mt-auto">
                    <button
                        onClick={handleExportCode}
                        className="w-full bg-purple-500 text-white p-3 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center"
                    >
                        <Download size={18} className="mr-2" />
                        Generar Código
                    </button>

                    <button
                        onClick={handleClearAll}
                        className="w-full bg-red-500 text-white p-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                        <Trash2 size={18} className="mr-2" />
                        Limpiar Todo
                    </button>
                </div>
            </div>

            {/* Área principal */}
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
                        <div className="flex items-center space-x-2">
                            {/* <button
                                onClick={() => setShowHelp(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
                                title="Ver tutorial"
                            >
                                <HelpCircle size={18} />
                                <span className="text-sm font-medium">Ayuda</span>
                            </button> */}
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

            {/* Modal de Tutorial */}
            {showHelp && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                        {/* Header del Modal */}
                        <div className="bg-blue-600 text-white p-6 rounded-t-xl flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {React.createElement(helpSteps[helpStep].icon, { size: 28 })}
                                <div>
                                    <h2 className="text-2xl font-bold">{helpSteps[helpStep].title}</h2>
                                    <p className="text-blue-100 text-sm">Paso {helpStep + 1} de {helpSteps.length}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowHelp(false);
                                    setHelpStep(0);
                                }}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Contenido del Paso */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {helpSteps[helpStep].content}
                        </div>

                        {/* Barra de Progreso */}
                        <div className="px-6 py-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((helpStep + 1) / helpSteps.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Footer con Navegación */}
                        <div className="bg-gray-50 p-4 rounded-b-xl flex items-center justify-between border-t border-gray-200">
                            <button
                                onClick={() => setHelpStep(Math.max(0, helpStep - 1))}
                                disabled={helpStep === 0}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    helpStep === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                <ChevronLeft size={18} />
                                <span>Anterior</span>
                            </button>

                            <div className="flex space-x-2">
                                {helpSteps.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setHelpStep(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            index === helpStep
                                                ? 'bg-blue-600 w-6'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>

                            {helpStep < helpSteps.length - 1 ? (
                                <button
                                    onClick={() => setHelpStep(Math.min(helpSteps.length - 1, helpStep + 1))}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <span>Siguiente</span>
                                    <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowHelp(false);
                                        setHelpStep(0);
                                    }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                >
                                    <span>¡Empezar!</span>
                                    <Zap size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}