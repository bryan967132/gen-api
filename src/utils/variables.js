export const dbDependency = {
    mysql: 'mysql2',
    oracle: 'oracledb',
    postgresql: 'pg',
};

export const paramTypes = {
    route: {
        alias: 'Route Params',
        buildExample: (path, params) =>
            `\n${params.reduce((path, param) => path.replace(`:${param}`, `<value:${param}>`), path)}\n`,
    },
    body: {
        alias: 'Request Body',
        buildExample: (path, params) =>
            `json\n{\n    ${params.map(param => `"${param}": <value|obj|array>`).join(',\n    ')}\n}\n`,
    },
    query: {
        alias: 'Query Params',
        buildExample: (path, params) =>
            `\n${path}?${params.map(param => `${param}=<value>`).join('&')}\n`,
    },
    headers: {
        alias: 'Headers',
        buildExample: (_, params) => `\n${params.map(param => `${param}: <value>`).join('\n')}\n`,
    },
};

export const codeResponse = {
    200: 'OK - 200',
    201: 'Created - 201',
    202: 'Accepted - 202',
    204: 'No Content - 204',
    400: 'Bad Request - 400',
    401: 'Unauthorized - 401',
    403: 'Forbidden - 403',
    404: 'Not Found - 404',
    409: 'Conflict - 409',
    422: 'Unprocessable Entity - 422',
    500: 'Internal Server Error - 500',
    503: 'Service Unavailable - 503',
};

export const dbVariables = {
    mysql: {
        name: 'MySQL',
        variables: [
            {
                envVariable: 'DB_HOST',
                variable: 'host',
                description: 'Dirección del servidor de base de datos',
                defaultValue: 'localhost',
            },
            {
                envVariable: 'DB_PORT',
                variable: 'port',
                description: 'Puerto del servidor de base de datos',
                defaultValue: '3306',
            },
            {
                envVariable: 'DB_USER',
                variable: 'user',
                description: 'Usuario de conexión',
                defaultValue: 'root',
            },
            {
                envVariable: 'DB_PASSWORD',
                variable: 'password',
                description: 'Contraseña de conexión',
                defaultValue: '1234',
            },
            {
                envVariable: 'DB_NAME',
                variable: 'database',
                description: 'Nombre de la base de datos',
                defaultValue: 'mi_bd',
            },
        ],
    },
    postgresql: {
        name: 'PostgreSQL',
        variables: [
            {
                envVariable: 'DB_HOST',
                variable: 'host',
                description: 'Dirección del servidor de base de datos',
                defaultValue: 'localhost',
            },
            {
                envVariable: 'DB_PORT',
                variable: 'port',
                description: 'Puerto del servidor de base de datos',
                defaultValue: '5432',
            },
            {
                envVariable: 'DB_USER',
                variable: 'user',
                description: 'Usuario de conexión',
                defaultValue: 'postgres',
            },
            {
                envVariable: 'DB_PASSWORD',
                variable: 'password',
                description: 'Contraseña de conexión',
                defaultValue: '1234',
            },
            {
                envVariable: 'DB_NAME',
                variable: 'database',
                description: 'Nombre de la base de datos',
                defaultValue: 'mi_bd',
            },
        ],
    },
    oracle: {
        name: 'Oracle',
        variables: [
            {
                envVariable: 'DB_HOST',
                variable: 'DB_HOST',
                description: 'Dirección del servidor de base de datos',
                defaultValue: 'localhost',
            },
            {
                envVariable: 'DB_PORT',
                variable: 'DB_PORT',
                description: 'Puerto del servidor de base de datos',
                defaultValue: '1521',
            },
            {
                envVariable: 'DB_SERVICE',
                variable: 'DB_SERVICE',
                description: 'Nombre del servicio de Oracle',
                defaultValue: 'XEPDB1',
            },
            {
                envVariable: 'DB_USER',
                variable: 'user',
                description: 'Usuario de conexión',
                defaultValue: 'system',
            },
            {
                envVariable: 'DB_PASSWORD',
                variable: 'password',
                description: 'Contraseña de conexión',
                defaultValue: '1234',
            },
        ],
    },
    mssql: {
        name: 'Microsoft SQL Server',
        variables: [
            {
                envVariable: 'DB_SERVER',
                variable: 'server',
                description: 'Dirección del servidor de base de datos',
                defaultValue: 'localhost',
            },
            {
                envVariable: 'DB_PORT',
                variable: 'port',
                description: 'Puerto del servidor de base de datos',
                defaultValue: '1433',
            },
            {
                envVariable: 'DB_USER',
                variable: 'user',
                description: 'Usuario de conexión',
                defaultValue: 'sa',
            },
            {
                envVariable: 'DB_PASSWORD',
                variable: 'password',
                description: 'Contraseña de conexión',
                defaultValue: '1234',
            },
            {
                envVariable: 'DB_NAME',
                variable: 'database',
                description: 'Nombre de la base de datos',
                defaultValue: 'mi_bd',
            },
        ],
    },
    mongodb: {
        name: 'MongoDB',
        variables: [
            {
                envVariable: 'DB_HOST',
                variable: 'DB_HOST',
                description: 'Dirección del servidor de MongoDB',
                defaultValue: 'localhost',
            },
            {
                envVariable: 'DB_PORT',
                variable: 'DB_PORT',
                description: 'Puerto del servidor de MongoDB',
                defaultValue: '27017',
            },
            {
                envVariable: 'DB_NAME',
                variable: 'DB_NAME',
                description: 'Nombre de la base de datos',
                defaultValue: 'mi_bd',
            },
        ],
    },
    redis: {
        name: 'Redis',
        variables: [
            {
                envVariable: 'DB_HOST',
                variable: 'DB_HOST',
                description: 'Dirección del servidor de Redis',
                defaultValue: 'localhost',
            },
            {
                envVariable: 'DB_PORT',
                variable: 'DB_PORT',
                description: 'Puerto del servidor de Redis',
                defaultValue: '6379',
            },
        ],
    },
};
