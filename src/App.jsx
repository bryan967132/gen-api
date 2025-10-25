import { useState, useRef } from 'react';
import { Route, Zap, Code, Settings, Download, Trash2, ChevronDown, ChevronUp, Move, Server, Globe, Hash, FileText, User, Search } from 'lucide-react';

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

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    
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
                    console.log('❌ Componente no encontrado:', movedId);
                    return prev;
                }

                console.log('📦 Moviendo componente al área principal:', movedComponent);
                const oldParentId = movedComponent.parentRoute;
                console.log('👴 Padre anterior:', oldParentId);

                // Actualizar todo en una pasada
                const newState = prev.map(comp => {
                    // Si es el padre anterior, removerlo de sus arrays
                    if (comp.id === oldParentId) {
                        console.log('🗑️ Removiendo de padre:', comp.name || comp.path);
                        return {
                            ...comp,
                            endpoints: comp.endpoints.filter(id => id !== movedId),
                            subRoutes: comp.subRoutes.filter(id => id !== movedId)
                        };
                    }
                    // Si es el componente que movemos, actualizar su parent
                    if (comp.id === movedId) {
                        console.log('✅ Actualizando componente - nuevo parent: null');
                        return { 
                            ...comp, 
                            parentRoute: null, 
                            level: 0 
                        };
                    }
                    return comp;
                });
                
                console.log('📊 Nuevo estado:', newState);
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
                parameters: '',
                successCode: 'return { message: "Success", data: {} };',
                errorCode: 'return { error: "Something went wrong", status: 500 };'
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
                        setTimeout(() => alert('No puedes anidar una ruta dentro de su propia subruta'), 0);
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
                    parameters: '',
                    successCode: 'return { message: "Success", data: {} };',
                    errorCode: 'return { error: "Something went wrong", status: 500 };'
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

    const generateAPICode = () => {
        const endpoints = components.filter(c => c.type === 'endpoint');
        
        let code = `// ${apiConfig.name}\n// ${apiConfig.description}\n\nconst express = require('express');\nconst app = express();\n\n`;
        code += `app.use(express.json());\napp.use(express.urlencoded({ extended: true }));\n\n`;
        
        endpoints.forEach(endpoint => {
            const method = endpoint.method.toLowerCase();
            const fullPath = getFullPath(endpoint);

            code += `// ${endpoint.method} ${fullPath}\n`;
            if (endpoint.parameterType !== 'none' && endpoint.parameters) {
                code += `// Parámetros (${endpoint.parameterType}): ${endpoint.parameters}\n`;
            }

            code += `app.${method}('${fullPath}', (req, res) => {\n`;

            if (endpoint.parameterType !== 'none' && endpoint.parameters) {
                switch (endpoint.parameterType) {
                    case 'route':
                        code += `  // Route params: ${endpoint.parameters}\n`;
                        code += `  const routeParams = req.params;\n`;
                        break;
                    case 'query':
                        code += `  // Query params: ${endpoint.parameters}\n`;
                        code += `  const queryParams = req.query;\n`;
                        break;
                    case 'body':
                        code += `  // Body params: ${endpoint.parameters}\n`;
                        code += `  const bodyData = req.body;\n`;
                        break;
                    case 'headers':
                        code += `  // Headers: ${endpoint.parameters}\n`;
                        code += `  const headers = req.headers;\n`;
                        break;
                }
            }

            code += `  try {\n`;
            code += `    ${endpoint.successCode}\n`;
            code += `  } catch (error) {\n`;
            code += `    ${endpoint.errorCode}\n`;
            code += `  }\n});\n\n`;
        });

        code += `app.listen(${apiConfig.port}, () => {\n  console.log('${apiConfig.name} running on port ${apiConfig.port}');\n});`;

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
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Descripción de Parámetros
                        </label>
                        <textarea
                            value={component.parameters}
                            onChange={(e) => updateComponent(component.id, { parameters: e.target.value })}
                            className="w-full px-2 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            rows="2"
                            placeholder={`Ej: ${component.parameterType === 'route' ? 'id, userId' : 
                                            component.parameterType === 'query' ? 'page, limit, search' :
                                            component.parameterType === 'body' ? 'name, email, password' :
                                            'authorization, content-type'}`}
                            onClick={(e) => e.stopPropagation()}
                            spellCheck={false}
                        />
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
                            className="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold text-xs border-none outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {httpMethods.map((method) => (
                                <option key={method} value={method}>{method}</option>
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

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Código de Respuesta Exitosa
                            </label>
                            <textarea
                                value={component.successCode}
                                onChange={(e) => updateComponent(component.id, { successCode: e.target.value })}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                                rows="2"
                                placeholder="res.json({ message: 'Success', data: {} });"
                                onClick={(e) => e.stopPropagation()}
                                spellCheck={false}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Código de Respuesta de Error
                            </label>
                            <textarea
                                value={component.errorCode}
                                onChange={(e) => updateComponent(component.id, { errorCode: e.target.value })}
                                className="w-full px-2 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                                rows="2"
                                placeholder="res.status(500).json({ error: 'Something went wrong' });"
                                onClick={(e) => e.stopPropagation()}
                                spellCheck={false}
                            />
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
                    <h3 className="text-xs font-semibold text-blue-800 mb-2">💡 Cómo usar:</h3>
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
                        onClick={() => {
                            const code = generateAPICode();
                            navigator.clipboard.writeText(code);
                            alert('¡Código copiado al portapapeles!');
                        }}
                        className="w-full bg-purple-500 text-white p-3 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center"
                    >
                        <Download size={18} className="mr-2" />
                        Generar Código
                    </button>

                    <button
                        onClick={() => {
                            setComponents([]);
                            setSelectedComponent(null);
                        }}
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
    );
}