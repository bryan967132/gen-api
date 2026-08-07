const getMySQLVars = () =>
    `\n\n# Variables DB MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=mi_bd`;

const getPostgreSQLVars = () =>
    `\n\n# Variables DB PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=mi_bd`;

const getOracleSQLVars = () =>
    `\n\n# Variables DB Oracle SQL
DB_HOST=localhost
DB_PORT=1521
DB_USER=system
DB_PASSWORD=1234
DB_SERVICE=XEPDB1`;

const getMSSQLVars = () =>
    `\n\n# Variables DB Microsoft SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=1234
DB_NAME=mi_bd`;

const getMongoDBVars = () =>
    `\n\n# Variables DB MongoDB
DB_HOST=localhost
DB_PORT=27017
DB_NAME=mi_bd`;

const getRedisVars = () =>
    `\n\n# Variables DB Redis
DB_HOST=localhost
DB_PORT=6379`;

const dbVars = {
    mysql: getMySQLVars,
    oracle: getOracleSQLVars,
    postgresql: getPostgreSQLVars,
    mssql: getMSSQLVars,
    mongodb: getMongoDBVars,
    redis: getRedisVars,
};

const getEnvContent = (port, { enabled, type }) => `# Variables API
API_PORT=${port}${enabled ? dbVars[type]() : ''}`;

export const generateEnvFile = (useEnvVar, port, { enabled, type }) =>
    useEnvVar ? getEnvContent(port, { enabled, type }) : undefined;
