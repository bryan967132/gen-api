/**
 * Utilidades para descargar archivos de código generado
 */

/**
 * Descarga un archivo de texto con el nombre y contenido especificado
 * @param {string} filename - Nombre del archivo a descargar
 * @param {string} content - Contenido del archivo
 */
export const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Descarga el código del servidor generado
 * @param {string} serverCode - Código del servidor
 */
export const downloadServerCode = (serverCode) => {
    downloadFile('server.js', serverCode);
};

/**
 * Descarga el archivo .env con las variables de entorno
 * @param {string} envContent - Contenido del archivo .env
 */
export const downloadEnvFile = (envContent) => {
    downloadFile('.env', envContent);
};

/**
 * Descarga el conector de base de datos
 * @param {string} dbCode - Código del conector de base de datos
 */
export const downloadDatabaseConnector = (dbCode) => {
    downloadFile('db.js', dbCode);
};

/**
 * Descarga múltiples archivos en secuencia
 * @param {Array<{filename: string, content: string}>} files - Array de objetos con filename y content
 */
export const downloadMultipleFiles = (files) => {
    files.forEach((file, index) => {
        setTimeout(() => {
            downloadFile(file.filename, file.content);
        }, index * 100); // Pequeño delay entre descargas para evitar problemas en algunos navegadores
    });
};

/**
 * Genera y descarga todos los archivos del proyecto
 * @param {string} serverCode - Código del servidor
 * @param {string} envContent - Contenido del archivo .env (opcional)
 * @param {string} dbCode - Código del conector de base de datos (opcional)
 */
export const downloadProjectFiles = (serverCode, envContent = null, dbCode = null) => {
    const files = [
        { filename: 'server.js', content: serverCode }
    ];

    if (envContent) {
        files.push({ filename: '.env', content: envContent });
    }

    if (dbCode) {
        files.push({ filename: 'db.js', content: dbCode });
    }

    downloadMultipleFiles(files);
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} - true si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        return false;
    }
};

/**
 * Descarga un archivo README con instrucciones de instalación
 * @param {Object} config - Configuración del proyecto
 */
export const downloadReadme = (config) => {
    const { apiName, port, useDb, dbType } = config;
    
    const dependencies = ['express'];
    if (config.useEnv) dependencies.push('dotenv');
    if (useDb) {
        if (dbType === 'mysql') dependencies.push('mysql2');
        else if (dbType === 'postgresql') dependencies.push('pg');
        else if (dbType === 'mongodb') dependencies.push('mongoose');
        else if (dbType === 'mssql') dependencies.push('mssql');
        else if (dbType === 'oracle') dependencies.push('oracledb');
        else if (dbType === 'redis') dependencies.push('redis');
    }

    const readmeContent = `# ${apiName}

API generada con GenAPI

## Instalación

1. Crear el proyecto:
\`\`\`bash
mkdir ${apiName.toLowerCase().replace(/\s+/g, '-')}
cd ${apiName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

2. Inicializar npm:
\`\`\`bash
npm init -y
\`\`\`

3. Instalar dependencias:
\`\`\`bash
npm install ${dependencies.join(' ')}
\`\`\`

4. Copiar los archivos generados:
   - server.js
${config.useEnv ? '   - .env (configurar las credenciales)\n' : ''}${useDb ? '   - db.js\n' : ''}

5. Ejecutar el servidor:
\`\`\`bash
node server.js
\`\`\`

## Configuración

El servidor se ejecutará en el puerto ${port}.

${config.useEnv ? `### Variables de Entorno

Configurar las siguientes variables en el archivo \`.env\`:
- PORT=${port}
${useDb ? `- DB_HOST=localhost
- DB_USER=tu_usuario
- DB_PASSWORD=tu_password
- DB_NAME=tu_base_de_datos
${dbType === 'mysql' || dbType === 'postgresql' || dbType === 'mssql' ? '- DB_PORT=' + (dbType === 'postgresql' ? '5432' : dbType === 'mssql' ? '1433' : '3306') : ''}
` : ''}
` : ''}

## Endpoints

Los endpoints disponibles se definen en el archivo server.js.

## Tecnologías

- Node.js
- Express.js
${useDb ? `- ${dbType.charAt(0).toUpperCase() + dbType.slice(1)}\n` : ''}${config.useEnv ? '- dotenv\n' : ''}

---
Generado con ❤️ por GenAPI
`;

    downloadFile('README.md', readmeContent);
};