import { Route, Zap, Move, ChevronUp, ChevronDown, Trash2, Hash, Search, FileText, User } from 'lucide-react';

export default function ComponentCard({
    component,
    components,
    selectedComponent,
    draggedComponent,
    isDragOver,
    getFullPath,
    getFullRoutePath,
    setComponents,
    deleteComponent,
    handleComponentClick,
    handleComponentDragStart,
    handleDragEnd,
    handleDragOver, 
    handleRouteDragEnter,
    handleRouteDragLeave,
    handleRouteDrop,
}) {
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const parameterTypes = [
        { value: 'none', label: 'Sin parámetros', icon: null },
        { value: 'route', label: 'Route Params', icon: Hash },
        { value: 'query', label: 'Query Params', icon: Search },
        { value: 'body', label: 'Body', icon: FileText },
        { value: 'headers', label: 'Headers', icon: User }
    ];

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

    const updateComponent = (id, updates) => {
        setComponents(components.map(comp =>
            comp.id === id ? { ...comp, ...updates } : comp
        ));
    };

    const toggleExpanded = (id) => {
        updateComponent(id, { expanded: !components.find(c => c.id === id).expanded });
    };

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

    const addResponseField = (componentId, responseType, key, value) => {
        if (!key.trim()) return;

        const component = components.find(c => c.id === componentId);
        if (!component) return;

        const responseKey = responseType === 'success' ? 'successResponse' : 'errorResponse';
        const currentResponse = component[responseKey];

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

    if (component.type === 'route') {
        return renderRoute(component);
    }

    return renderEndpoint(component);
}