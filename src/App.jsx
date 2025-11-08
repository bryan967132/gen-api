import { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { generateEnvFile, generateAPICode } from './utils/codeGenerator';
import Sidebar from './components/Sidebar';
import TutorialModal from './components/TutorialModal';
import CodeGenModal from './components/CodeGenModal';
import ConfigSummaryModal from './components/ConfigSummaryModal';
import Header from './components/Header';
import EmptyCanvas from './components/EmptyCanvas';
import ComponentCard from './components/ComponentCard';

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

    const [showTutorialModal, setShowTutorialModal] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    const [showCodeGenModal, setShowCodeGenModal] = useState(false);
    const [showConfigSummary, setShowConfigSummary] = useState(false);
    const [tempUseEnv, setTempUseEnv] = useState(true);
    const [tempUseDb, setTempUseDb] = useState(false);
    const [tempDbType, setTempDbType] = useState('mysql');

    const [useEnvironmentVariables, setUseEnvironmentVariables] = useState(true);
    const [databaseConfig, setDatabaseConfig] = useState({
        enabled: false,
        type: 'mysql'
    });

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

    const handleDragStart = (e, componentType) => {
        e.dataTransfer.setData('componentType', componentType);
        e.dataTransfer.effectAllowed = 'copy';
        dragCounter.current = 0;
    };

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

        if (componentId) {
            const movedId = parseFloat(componentId);

            setComponents(prev => {
                const movedComponent = prev.find(c => c.id === movedId);
                if (!movedComponent) {
                    console.log('[ERROR] Componente no encontrado:', movedId);
                    return prev;
                }

                const oldParentId = movedComponent.parentRoute;

                const newState = prev.map(comp => {
                    if (comp.id === oldParentId) {
                        return {
                            ...comp,
                            endpoints: comp.endpoints.filter(id => id !== movedId),
                            subRoutes: comp.subRoutes.filter(id => id !== movedId)
                        };
                    }
                    if (comp.id === movedId) {
                        return { 
                            ...comp, 
                            parentRoute: null, 
                            level: 0 
                        };
                    }
                    return comp;
                });
                return newState;
            });
            
            setDraggedComponent(null);
            return;
        }

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

        if (componentId) {
            const movedId = parseFloat(componentId);
            
            setComponents(prev => {
                const movedComponent = prev.find(c => c.id === movedId);
                const targetRoute = prev.find(c => c.id === routeId);
                
                if (!movedComponent || !targetRoute || movedId === routeId) return prev;

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

                return prev.map(comp => {
                    if (comp.id === oldParentId) {
                        return {
                            ...comp,
                            endpoints: comp.endpoints.filter(id => id !== movedId),
                            subRoutes: comp.subRoutes.filter(id => id !== movedId)
                        };
                    }
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

    const validateDuplicates = () => {
        const errors = [];

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

        routes.forEach(route => {
            if (route.parentRoute) {
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

    const handleExportCode = async () => {
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

        if (components.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'No hay componentes',
                text: 'Agrega rutas y endpoints antes de generar el código',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }

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

        setTempUseEnv(useEnvironmentVariables);
        setTempUseDb(databaseConfig.enabled);
        setTempDbType(databaseConfig.type);
        setShowCodeGenModal(true);
    };

    const handleContinueFromConfig = () => {
        setUseEnvironmentVariables(tempUseEnv);
        setDatabaseConfig({ enabled: tempUseDb, type: tempDbType });
        setShowCodeGenModal(false);
        setShowConfigSummary(true);
    };

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

    const renderComponent = (component) => {
        if (component.parentRoute) {
            return null;
        }

        return <ComponentCard
            key={component.id}
            component={component}
            components={components}
            selectedComponent={selectedComponent}
            draggedComponent={draggedComponent}
            isDragOver={isDragOver}
            getFullPath={getFullPath}
            getFullRoutePath={getFullRoutePath}
            setComponents={setComponents}
            deleteComponent={deleteComponent}
            handleComponentClick={handleComponentClick}
            handleComponentDragStart={handleComponentDragStart}
            handleDragOver={handleDragOver}
            handleDragEnd={handleDragEnd}
            handleRouteDragEnter={handleRouteDragEnter}
            handleRouteDragLeave={handleRouteDragLeave}
            handleRouteDrop={handleRouteDrop}
        />;
    };

    const routeCount = components.filter(c => c.type === 'route').length;
    const endpointCount = components.filter(c => c.type === 'endpoint').length;
    const nestedEndpointCount = components.filter(c => c.type === 'endpoint' && c.parentRoute).length;
    const independentEndpointCount = endpointCount - nestedEndpointCount;

    return (
        <>
            <style>{`
                .blur-backdrop {
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                }

                .swal2-container.blur-backdrop {
                    background: rgba(0, 0, 0, 0.6) !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                }

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
                    <Header
                        apiConfig={apiConfig}
                        routeCount={routeCount}
                        independentEndpointCount={independentEndpointCount}
                        nestedEndpointCount={nestedEndpointCount}
                        onShowTutorial={showTutorial}
                    />

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
                            <EmptyCanvas />
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