const envOrValue = (useEnvVar, envName, defaultValue) =>
    useEnvVar ? `process.env.${envName} || ${defaultValue}` : defaultValue;

const getMySQLConnector = useEnvVar => ({
    content: `import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
    host: ${envOrValue(useEnvVar, 'DB_HOST', 'localhost')},
    port: ${envOrValue(useEnvVar, 'DB_PORT', '3306')},
    user: ${envOrValue(useEnvVar, 'DB_USER', "'root'")},
    password: ${envOrValue(useEnvVar, 'DB_PASSWORD', "'1234'")},
    database: ${envOrValue(useEnvVar, 'DB_NAME', "'mi_bd'")}
});

export default connection;`,
    exported: 'connection',
});

const getPostgreSQLClient = useEnvVar => ({
    content: `import { Client } from "pg";

const client = new Client({
    host: ${envOrValue(useEnvVar, 'DB_HOST', 'localhost')},
    port: ${envOrValue(useEnvVar, 'DB_PORT', '5432')},
    user: ${envOrValue(useEnvVar, 'DB_USER', "'postgres'")},
    password: ${envOrValue(useEnvVar, 'DB_PASSWORD', "'1234'")},
    database: ${envOrValue(useEnvVar, 'DB_NAME', "'mi_bd'")}
});

await client.connect();

export default client;`,
    exported: 'client',
});

const getOracleSQLConnector = useEnvVar => ({
    content: `import oracledb from "oracledb";

const DB_HOST = ${envOrValue(useEnvVar, 'DB_HOST', "'localhost'")};
const DB_PORT = ${envOrValue(useEnvVar, 'DB_PORT', '1521')};
const DB_SERVICE = ${envOrValue(useEnvVar, 'DB_SERVICE', "'XEPDB1'")};

const connection = await oracledb.getConnection({
    user: ${envOrValue(useEnvVar, 'DB_USER', "'system'")},
    password: ${envOrValue(useEnvVar, 'DB_PASSWORD', "'1234'")},
    connectString: \`\${DB_HOST}:\${DB_PORT}/\${DB_SERVICE}\`
});

export default connection;`,
    exported: 'connection',
});

const getMSSQLPool = useEnvVar => ({
    content: `import sql from "mssql";

const pool = await sql.connect({
    server: ${envOrValue(useEnvVar, 'DB_HOST', "'localhost'")},
    port: ${envOrValue(useEnvVar, 'DB_PORT', '1433')},
    user: ${envOrValue(useEnvVar, 'DB_USER', "'sa'")},
    password: ${envOrValue(useEnvVar, 'DB_PASSWORD', "'1234'")},
    database: ${envOrValue(useEnvVar, 'DB_NAME', "'mi_bd'")}
});

export default pool;`,
    exported: 'pool',
});

const getMongoDB = useEnvVar => ({
    content: `import { MongoClient } from "mongodb";

const DB_HOST = ${envOrValue(useEnvVar, 'DB_HOST', "'localhost'")};
const DB_PORT = ${envOrValue(useEnvVar, 'DB_PORT', '27017')};

const client = new MongoClient(
    \`mongodb://\${DB_HOST}:\${DB_PORT}\`
);

await client.connect();

const db = client.db(${envOrValue(useEnvVar, 'DB_NAME', "'mi_bd'")});

export default db;`,
    exported: 'db',
});

const getRedisClient = useEnvVar => ({
    content: `import { createClient } from "redis";

const DB_HOST = ${envOrValue(useEnvVar, 'DB_HOST', "'localhost'")};
const DB_PORT = ${envOrValue(useEnvVar, 'DB_PORT', '6379')};

const client = createClient({
    url: \`redis://\${DB_HOST}:\${DB_PORT}\`
});

await client.connect();

export default client;`,
    exported: 'client',
});

const dbConfig = {
    mysql: getMySQLConnector,
    oracle: getPostgreSQLClient,
    postgresql: getOracleSQLConnector,
    mssql: getMSSQLPool,
    mongodb: getMongoDB,
    redis: getRedisClient,
};

export const generateDBConnector = (useEnvVar, { enabled, type }) =>
    enabled ? dbConfig[type](useEnvVar) : { content: undefined, exported: undefined };
