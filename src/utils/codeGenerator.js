// Funciones de generación de código extraídas del archivo original

export const generateDatabaseConnector = (databaseConfig) => {
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

export const generateEnvFile = (useEnvironmentVariables, databaseConfig) => {
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

export const generateAPICode = (components, apiConfig, useEnvironmentVariables, databaseConfig, getFullPath) => {
    const endpoints = components.filter(c => c.type === 'endpoint');
    
    let code = `// ${apiConfig.name}\n// ${apiConfig.description}\n\n`;
    
    // Requerir dotenv si se usan variables de entorno O si hay base de datos
    if (useEnvironmentVariables || databaseConfig.enabled) {
        code += `require('dotenv').config();\n`;
    }
    
    code += `const express = require('express');\nconst app = express();\n\n`;
    code += `app.use(express.json());\napp.use(express.urlencoded({ extended: true }));\n`;
    
    // Agregar conector de base de datos
    code += generateDatabaseConnector(databaseConfig);
    
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