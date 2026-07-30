import { generateAPICode } from '../src/generator/codeGenerator.js';

const getFullPath = component => {
    const routeParams =
        component.parameterType === 'route'
            ? component.params.map(param => `/:${param}`).join('')
            : '';

    if (!component.parentRoute) {
        return component.path + routeParams;
    }

    const parentRoute = components.find(c => c.id === component.parentRoute);
    if (!parentRoute) return component.path + routeParams;

    const parentPath = getFullRoutePath(parentRoute);
    return parentPath + component.path + routeParams;
};

const getFullRoutePath = route => {
    if (!route.parentRoute) return route.basePath;

    const parentRoute = components.find(c => c.id === route.parentRoute);
    if (!parentRoute) return route.basePath;

    return getFullRoutePath(parentRoute) + route.basePath;
};

const getFullName = component => {
    if (!component.parentRoute) return component.name;

    const parentRoute = components.find(c => c.id === component.parentRoute);
    if (!parentRoute) return component.name;

    return getFullRouteName(parentRoute);
};

const getFullRouteName = route => {
    if (!route.parentRoute) return route.name;

    const parentRoute = components.find(c => c.id === route.parentRoute);
    if (!parentRoute) return route.name;

    return getFullRouteName(parentRoute) + ' - ' + route.name;
};

const getRelativePath = component => {
    const fullPath = getFullPath(component);
    return component.parentRoute ? fullPath.replace(/^\/[^/]+/, '') : fullPath;
};

// const components = [
//     {
//         id: 1785042978190.4468,
//         type: 'route',
//         expanded: true,
//         parentRoute: null,
//         level: 0,
//         name: 'Usuarios',
//         basePath: '/usuarios',
//         endpoints: [1785042979005.0398, 1785042980636.7197],
//         subRoutes: [],
//     },
//     {
//         id: 1785042979005.0398,
//         type: 'endpoint',
//         expanded: true,
//         parentRoute: 1785042978190.4468,
//         level: 1,
//         method: 'GET',
//         path: '/login',
//         parameterType: 'query',
//         params: ['email', 'password'],
//         successResponse: {
//             statusCode: 200,
//             fields: [
//                 {
//                     key: 'message',
//                     value: 'Success',
//                 },
//                 {
//                     key: 'data',
//                     value: '{}',
//                 },
//             ],
//         },
//         errorResponse: {
//             statusCode: 500,
//             fields: [
//                 {
//                     key: 'error',
//                     value: 'Something went wrong',
//                 },
//             ],
//         },
//     },
//     {
//         id: 1785042980636.7197,
//         type: 'endpoint',
//         expanded: true,
//         parentRoute: 1785042978190.4468,
//         level: 1,
//         method: 'POST',
//         path: '/registro',
//         parameterType: 'body',
//         params: ['name', 'email', 'password'],
//         successResponse: {
//             statusCode: 200,
//             fields: [
//                 {
//                     key: 'message',
//                     value: 'Success',
//                 },
//                 {
//                     key: 'data',
//                     value: '{}',
//                 },
//             ],
//         },
//         errorResponse: {
//             statusCode: 500,
//             fields: [
//                 {
//                     key: 'error',
//                     value: 'Something went wrong',
//                 },
//             ],
//         },
//     },
// ];

const components = [
    {
        id: 1785043283699.2446,
        type: 'route',
        expanded: true,
        parentRoute: null,
        level: 0,
        name: 'Usuarios',
        basePath: '/usuarios',
        endpoints: [],
        subRoutes: [1785043301651.7854, 1785043305888.6501, 1785044022384.71, 1785044030429.0737],
    },
    {
        id: 1785043301651.7854,
        type: 'route',
        expanded: true,
        parentRoute: 1785043283699.2446,
        level: 1,
        name: 'Autenticacion',
        basePath: '/autenticacion',
        endpoints: [1785044122666.494, 1785044124056.334, 1785044242453.0808],
        subRoutes: [],
    },
    {
        id: 1785043305888.6501,
        type: 'route',
        expanded: true,
        parentRoute: 1785043283699.2446,
        level: 1,
        name: 'Consulta',
        basePath: '/consulta',
        endpoints: [1785044264795.2441, 1785044266030.5288, 1785044267763.581],
        subRoutes: [],
    },
    {
        id: 1785044022384.71,
        type: 'route',
        expanded: true,
        parentRoute: 1785043283699.2446,
        level: 1,
        name: 'Modificacion',
        basePath: '/modificacion',
        endpoints: [1785044395104.2024, 1785044396798.7742],
        subRoutes: [],
    },
    {
        id: 1785044030429.0737,
        type: 'route',
        expanded: true,
        parentRoute: 1785043283699.2446,
        level: 1,
        name: 'Eliminacion',
        basePath: '/eliminacion',
        endpoints: [1785044474198.2637],
        subRoutes: [],
    },
    {
        id: 1785044122666.494,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785043301651.7854,
        level: 2,
        method: 'POST',
        path: '/login',
        parameterType: 'body',
        params: ['correo', 'contrasena'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044124056.334,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785043301651.7854,
        level: 2,
        method: 'POST',
        path: '/registro',
        parameterType: 'body',
        params: ['nombre', 'correo', 'contrasena'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044242453.0808,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785043301651.7854,
        level: 2,
        method: 'POST',
        path: '/logout',
        parameterType: 'body',
        params: ['id'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044264795.2441,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785043305888.6501,
        level: 2,
        method: 'GET',
        path: '/todosUsuarios',
        parameterType: 'none',
        params: [],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044266030.5288,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785043305888.6501,
        level: 2,
        method: 'GET',
        path: '/miUsuario',
        parameterType: 'none',
        params: [],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044267763.581,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785043305888.6501,
        level: 2,
        method: 'GET',
        path: '/usuarioId',
        parameterType: 'route',
        params: ['id'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044395104.2024,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785044022384.71,
        level: 2,
        method: 'PUT',
        path: '/actualizar',
        parameterType: 'query',
        params: ['id'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044396798.7742,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785044022384.71,
        level: 2,
        method: 'PATCH',
        path: '/cambiarContrasena',
        parameterType: 'query',
        params: ['id', 'contrasena'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
    {
        id: 1785044474198.2637,
        type: 'endpoint',
        expanded: true,
        parentRoute: 1785044030429.0737,
        level: 2,
        method: 'DELETE',
        path: '/eliminarUsuario',
        parameterType: 'query',
        params: ['id'],
        successResponse: {
            statusCode: 200,
            fields: [
                {
                    key: 'message',
                    value: 'Success',
                },
                {
                    key: 'data',
                    value: '{}',
                },
            ],
        },
        errorResponse: {
            statusCode: 500,
            fields: [
                {
                    key: 'error',
                    value: 'Something went wrong',
                },
            ],
        },
    },
];

const { readme, envContent, packageJSON, dbConfig, groups, index } = await generateAPICode(
    components,
    {
        name: 'Mi API',
        port: 4000,
        description: 'API generada con GenAPI',
    },
    true,
    {
        enabled: true,
        type: 'mssql',
    },
    getRelativePath
);

// console.log(components);
groups.forEach(({ groupName, controller, route }) => {
    console.log('\u001B[96m========== GROUP NAME:', groupName, '==========\u001B[0m');
    console.log(`\u001B[32m----- ./src/controllers/${groupName}.controller.js -----\u001B[0m`);
    console.log(controller);
    console.log();
    console.log(`\u001B[32m----- ./src/routes/${groupName}.routes.js -----\u001B[0m`);
    console.log(route);
    console.log();
});

console.log('\u001B[96m========== index.js ==========\u001B[0m');
console.log(index);
console.log();

console.log('\u001B[96m========== ./src/configurations/database.config.js ==========\u001B[0m');
console.log(dbConfig);
console.log();

console.log('\u001B[96m========== package.json ==========\u001B[0m');
console.log(packageJSON);
console.log();

console.log('\u001B[96m========== .env ==========\u001B[0m');
console.log(envContent);
console.log();

console.log('\u001B[96m========== README.md ==========\u001B[0m');
console.log(readme);
console.log();
