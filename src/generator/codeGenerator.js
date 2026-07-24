const structure = [
    { id: 1, name: 'src', type: 'folder', parent: null },
    { id: 2, name: 'config', type: 'folder', parent: 1 },
    { id: 3, name: 'controllers', type: 'folder', parent: 1 },
    { id: 4, name: 'routes', type: 'folder', parent: 1 },
    { id: 5, name: 'utils', type: 'folder', parent: 1 },
];

const generateDatabaseConnector = (databaseConfig) => {
    if (!databaseConfig.enabled) return '';

    const { type } = databaseConfig;
    let code = '';

    if (type === 'mysql') {
        code += `\n// MySQL Database Connection\n`;
        code += `const mysql = require('mysql2/promise');\n\n`;
        code += `const pool = mysql.createPool({\n`;
        code += `    host: process.env.DB_HOST,\n`;
        code += `    port: process.env.DB_PORT,\n`;
        code += `    database: process.env.DB_DATABASE,\n`;
        code += `    user: process.env.DB_USER,\n`;
        code += `    password: process.env.DB_PASSWORD,\n`;
        code += `    waitForConnections: true,\n`;
        code += `    connectionLimit: 10,\n`;
        code += `    queueLimit: 0\n`;
        code += `});\n\n`;
        code += `// Test database connection\n`;
        code += `pool.getConnection()\n`;
        code += `    .then(connection => {\n`;
        code += `        console.log('[SUCCESS] MySQL Database connected successfully');\n`;
        code += `        connection.release();\n`;
        code += `    })\n`;
        code += `    .catch(err => {\n`;
        code += `        console.error('[ERROR] MySQL Database connection failed:', err.message);\n`;
        code += `    });\n\n`;
    } else if (type === 'oracle') {
        code += `\n// Oracle SQL Database Connection\n`;
        code += `const oracledb = require('oracledb');\n\n`;
        code += `oracledb.autoCommit = true;\n\n`;
        code += `async function initializeDatabase() {\n`;
        code += `    try {\n`;
        code += `        await oracledb.createPool({\n`;
        code += `            user: process.env.DB_USER,\n`;
        code += `            password: process.env.DB_PASSWORD,\n`;
        code += `            connectString: process.env.DB_CONNECTION_STRING,\n`;
        code += `            poolMin: 2,\n`;
        code += `            poolMax: 10,\n`;
        code += `            poolIncrement: 1\n`;
        code += `        });\n`;
        code += `        console.log('[SUCCESS] Oracle Database connected successfully');\n`;
        code += `    } catch (err) {\n`;
        code += `        console.error('[ERROR] Oracle Database connection failed:', err.message);\n`;
        code += `    }\n`;
        code += `}\n\n`;
        code += `initializeDatabase();\n\n`;
    } else if (type === 'postgresql') {
        code += `\n// PostgreSQL Database Connection\n`;
        code += `const { Pool } = require('pg');\n\n`;
        code += `const pool = new Pool({\n`;
        code += `    host: process.env.DB_HOST,\n`;
        code += `    port: process.env.DB_PORT,\n`;
        code += `    database: process.env.DB_DATABASE,\n`;
        code += `    user: process.env.DB_USER,\n`;
        code += `    password: process.env.DB_PASSWORD,\n`;
        code += `    max: 10,\n`;
        code += `    idleTimeoutMillis: 30000\n`;
        code += `});\n\n`;
        code += `// Test database connection\n`;
        code += `pool.connect()\n`;
        code += `    .then(client => {\n`;
        code += `        console.log('[SUCCESS] PostgreSQL Database connected successfully');\n`;
        code += `        client.release();\n`;
        code += `    })\n`;
        code += `    .catch(err => {\n`;
        code += `        console.error('[ERROR] PostgreSQL Database connection failed:', err.message);\n`;
        code += `    });\n\n`;
    } else if (type === 'mssql') {
        code += `\n// Microsoft SQL Server Database Connection\n`;
        code += `const sql = require('mssql');\n\n`;
        code += `const sqlConfig = {\n`;
        code += `    user: process.env.DB_USER,\n`;
        code += `    password: process.env.DB_PASSWORD,\n`;
        code += `    database: process.env.DB_DATABASE,\n`;
        code += `    server: process.env.DB_HOST,\n`;
        code += `    port: parseInt(process.env.DB_PORT),\n`;
        code += `    pool: {\n`;
        code += `        max: 10,\n`;
        code += `        min: 0,\n`;
        code += `        idleTimeoutMillis: 30000\n`;
        code += `    },\n`;
        code += `    options: {\n`;
        code += `        encrypt: true,\n`;
        code += `        trustServerCertificate: true\n`;
        code += `    }\n`;
        code += `};\n\n`;
        code += `// Test database connection\n`;
        code += `sql.connect(sqlConfig)\n`;
        code += `    .then(pool => {\n`;
        code += `        console.log('[SUCCESS] MSSQL Database connected successfully');\n`;
        code += `    })\n`;
        code += `    .catch(err => {\n`;
        code += `        console.error('[ERROR] MSSQL Database connection failed:', err.message);\n`;
        code += `    });\n\n`;
    } else if (type === 'mongodb') {
        code += `\n// MongoDB Database Connection\n`;
        code += `const { MongoClient } = require('mongodb');\n\n`;
        code += `const mongoUrl = process.env.MONGO_URL || \`mongodb://\${process.env.DB_USER}:\${process.env.DB_PASSWORD}@\${process.env.DB_HOST}:\${process.env.DB_PORT}/\${process.env.DB_DATABASE}\`;\n`;
        code += `const mongoClient = new MongoClient(mongoUrl);\n\n`;
        code += `let db;\n\n`;
        code += `// Connect to MongoDB\n`;
        code += `mongoClient.connect()\n`;
        code += `    .then(() => {\n`;
        code += `        db = mongoClient.db();\n`;
        code += `        console.log('[SUCCESS] MongoDB Database connected successfully');\n`;
        code += `    })\n`;
        code += `    .catch(err => {\n`;
        code += `        console.error('[ERROR] MongoDB Database connection failed:', err.message);\n`;
        code += `    });\n\n`;
    } else if (type === 'redis') {
        code += `\n// Redis Database Connection\n`;
        code += `const redis = require('redis');\n\n`;
        code += `const redisClient = redis.createClient({\n`;
        code += `    host: process.env.REDIS_HOST,\n`;
        code += `    port: process.env.REDIS_PORT,\n`;
        code += `    password: process.env.REDIS_PASSWORD\n`;
        code += `});\n\n`;
        code += `redisClient.on('connect', () => {\n`;
        code += `    console.log('[SUCCESS] Redis Database connected successfully');\n`;
        code += `});\n\n`;
        code += `redisClient.on('error', (err) => {\n`;
        code += `    console.error('[ERROR] Redis Database connection failed:', err.message);\n`;
        code += `});\n\n`;
        code += `redisClient.connect();\n\n`;
    }

    return code;
};

const generateEnvFile = (useEnvironmentVariables, databaseConfig) => {
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

const getEndpointsDeep = (components, routeId) => {
    const directEndpoints = components.filter(
        (c) => c.type === 'endpoint' && c.parentRoute === routeId
    );
    const childRoutes = components.filter((c) => c.type === 'route' && c.parentRoute === routeId);

    const nestedEndpoints = childRoutes.flatMap((child) => getEndpointsDeep(components, child.id));

    return [...directEndpoints, ...nestedEndpoints];
};

/**
 * Genera el código base de una API según los componentes, configuración y opciones proporcionadas.
 *
 * @param {Object[]} components - Lista de componentes o módulos que se incluirán en la API.
 * @param {Object} apiConfig - Configuración general de la API (por ejemplo: nombre, puerto, prefijo de rutas, etc.).
 * @param {boolean} useEnvironmentVariables - Indica si se deben usar variables de entorno para las configuraciones.
 * @param {Object} databaseConfig - Configuración de la base de datos, incluyendo tipo, credenciales y opciones de conexión.
 * @param {Function} getFullPath - Función que devuelve la ruta absoluta a un archivo o directorio según una ruta relativa.
 * @returns {string} Código generado de la API en formato de texto.
 */
export const generateAPICode = (
    components,
    apiConfig,
    useEnvironmentVariables,
    databaseConfig,
    getFullInfo
) => {
    const endpointGroups = components
        .filter((c) => c.type === 'route' && c.level === 0)
        .map((route) => ({ endpoints: getEndpointsDeep(components, route.id) }));

    const rootEndpointGroup = {
        endpoints: components.filter((c) => c.type === 'endpoint' && c.level === 0),
    };

    for (const group of [...endpointGroups, rootEndpointGroup]) {
        console.log(group.id);
        console.log(group.endpoints);
    }

    return {
        code: 'Código generado de la API',
        envContent: generateEnvFile(useEnvironmentVariables, databaseConfig),
    };
};
