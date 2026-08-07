import { generateControllerGroup } from './controllerGenerator.js';
import { generateRouterGroup } from './routeGenerator.js';
import { generateIndex } from './indexGenerator.js';
import { generateDBConnector } from './dbConnectorGenerator.js';
import { generatePackage } from './packageGenerator.js';
import { generateEnvFile } from './envFileGenerator.js';
import { generateREADME } from './readmeGenerator.js';

const getEndpointsDeep = (components, routeId) => {
    const directEndpoints = components.filter(
        c => c.type === 'endpoint' && c.parentRoute === routeId
    );
    const childRoutes = components.filter(c => c.type === 'route' && c.parentRoute === routeId);
    const nestedEndpoints = childRoutes.flatMap(child => getEndpointsDeep(components, child.id));
    return [...directEndpoints, ...nestedEndpoints];
};

const getName = (path, method) =>
    (method?.toLowerCase() || '') +
    path
        .split(/[/-\s]+/)
        .filter(Boolean)
        .map((part, index) =>
            method || (!method && index > 0)
                ? part.charAt(0).toUpperCase() + part.slice(1)
                : part.toLowerCase()
        )
        .join('');

const buildGroup = (endpointGroup, { enabled, exported }, getRelativePath) => {
    const groupName = getName(endpointGroup.name);
    const controllers = generateControllerGroup(endpointGroup, getName, getRelativePath);
    return {
        groupName,
        path: endpointGroup.path,
        docController: controllers.map(
            ({ method, parameterType, params, path, successResponse, errorResponse }) => ({
                method,
                parameterType,
                params,
                path,
                successResponse,
                errorResponse,
            })
        ),
        controller: `${
            enabled ? `import ${exported} from '../configurations/database.config.js';\n\n` : ''
        }${controllers.map(c => c.content).join('\n\n')}`,
        route: generateRouterGroup(groupName, controllers),
    };
};

/**
 * Genera el código base de una API según los componentes, configuración y opciones proporcionadas.
 *
 * @param {Object[]} components - Lista de componentes o módulos que se incluirán en la API.
 * @param {Object} apiConfig - Configuración general de la API (por ejemplo: nombre, puerto, prefijo de rutas, etc.).
 * @param {boolean} useEnvVar - Indica si se deben usar variables de entorno para las configuraciones.
 * @param {Object} databaseConfig - Configuración de la base de datos, incluyendo tipo, credenciales y opciones de conexión.
 * @param {Function} getRelativePath - Función que devuelve información de rutas.
 * @returns {string} Código generado de la API en formato de texto.
 */
export const generateAPICode = async (
    components,
    { name, port, description },
    useEnvVar,
    databaseConfig,
    getRelativePath
) => {
    const endpointGroups = components
        .filter(c => c.type === 'route' && c.level === 0)
        .map(route => ({
            id: route.id,
            name: route.name,
            path: route.basePath,
            endpoints: getEndpointsDeep(components, route.id),
        }));

    const rootEndpointGroup = {
        id: null,
        name: 'root',
        path: '/',
        endpoints: components.filter(c => c.type === 'endpoint' && c.level === 0),
    };

    const allEndpointsGroups = [
        ...endpointGroups,
        ...(rootEndpointGroup.endpoints.length > 0 ? [rootEndpointGroup] : []),
    ];

    const { content: dbConfig, exported } = generateDBConnector(useEnvVar, databaseConfig);

    const groups = allEndpointsGroups.map(group =>
        buildGroup(group, { enabled: databaseConfig.enabled, exported }, getRelativePath)
    );

    const { content, dependencies, devDependencies } = await generatePackage(
        name,
        description,
        useEnvVar,
        databaseConfig
    );

    return {
        readme: generateREADME(
            name,
            description,
            useEnvVar,
            databaseConfig,
            groups.map(({ groupName, path, docController }) => ({
                groupName,
                path,
                docController,
            })),
            dependencies,
            devDependencies
        ),
        packageJSON: content,
        envContent: generateEnvFile(useEnvVar, port, databaseConfig),
        dbConfig,
        groups,
        index: generateIndex(
            useEnvVar,
            port,
            groups.map(({ groupName, path }) => ({ groupName, path }))
        ),
    };
};
