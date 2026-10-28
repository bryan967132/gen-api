import { paramTypes, codeResponse, dbVariables } from '../utils/variables.js';

const getDataResponse = (fields, indent = 8) =>
    fields
        .map(
            ({ key, value }) =>
                `\n${' '.repeat(indent)}"${key}": ${['{}', '[]', '()'].includes(value) ? value : `"${value}"`}`
        )
        .join(',');

const getResponse = (successResponse, errorResponse) => `\n* **Response**:
    * ${codeResponse[successResponse.statusCode]}
    \`\`\`json
    {
${getDataResponse(successResponse.fields)}
    }
    \`\`\`
    * ${codeResponse[errorResponse.statusCode]}
    \`\`\`json
    {
${getDataResponse(errorResponse.fields)}
    }
    \`\`\``;

const getRequest = (parameterType, path, params) =>
    parameterType !== 'none'
        ? `\n* **${(parameterType = paramTypes[parameterType]).alias}**:
\`\`\`${parameterType.buildExample(path, params)}\`\`\``
        : '\n* **Sin Parametros**';

const getEndpoints = (path, docController) =>
    docController
        .map(
            ({ method, parameterType, params, path: localPath, successResponse, errorResponse }) =>
                `\n**${method}** \`${`${path}${localPath}`.replaceAll('//', '/')}\`${getRequest(
                    parameterType,
                    `${path}${localPath}`,
                    params
                )}${getResponse(successResponse, errorResponse)}`
        )
        .join('\n');

const getGroups = groups =>
    groups
        .map(
            ({ groupName, path, docController }) =>
                `\n### ${groupName
                    .charAt(0)
                    .toUpperCase()}${groupName.slice(1)}: \`./src/routes/${groupName}.routes.js\`${getEndpoints(
                    path,
                    docController
                )}`
        )
        .join('\n---\n');

export const generateREADME = (
    name,
    description,
    useEnvVar,
    { enabled: dbEnabled, type: dbType },
    groups,
    dependencies,
    devDependencies
) => `# ${name}
${description}

## Node JS

Antes de ejecutar la API, asegúrate de tener instalado Node.js en tu equipo. Si aún no lo tienes instalado, sigue estos pasos:

* Ingresa al sitio oficial de [Node.js](https://nodejs.org/en/download).
* Descarga la versión LTS (Long Term Support) recomendada para tu sistema operativo.
* Ejecuta el instalador y sigue las instrucciones.
* Verifica que la instalación se haya completado correctamente ejecutando los siguientes comandos en una terminal:
    \`\`\`sh
    node -v
    npm -v
    \`\`\`

## pnpm

Se recomienda el uso de \`pnpm\` como gestor de paquetes por sus mecanismos adicionales de seguridad y control de dependencias, que ayudan a reducir ciertos riesgos asociados a la instalación de paquetes. No obstante, también es posible utilizar npm como alternativa.

Una vez instalado Node.js, instala pnpm ejecutando el siguiente comando:
\`\`\`sh
npm install -g pnpm
\`\`\`

Verifica que pnpm se haya instalado correctamente:
\`\`\`sh
pnpm -v
\`\`\`

## Preparación del Entorno
### Instalación de Dependencias
\`\`\`sh
# npm
npm install

# pnpm
pnpm install
\`\`\`

## Ejecución del Proyecto
### Desarrollo
\`\`\`sh
# npm
npm run dev

# pnpm
pnpm dev
\`\`\`

### Producción
\`\`\`sh
# npm
npm start

# pnpm
pnpm start
\`\`\`

## Endpoints${getGroups(groups)}

## Estructura del Proyecto
\`\`\`
${name.trim().toLowerCase().replaceAll(/\s+/g, '-')}
├── src${dbEnabled ? '\n│   ├── configurations\n│   │   └── database.config.js' : ''}
│   ├── controllers${groups
    .map(
        ({ groupName }, index) =>
            `${index < groups.length - 1 ? '\n│   │   ├── ' : '\n│   │   └── '}${groupName}.controller.js`
    )
    .join('')}
│   └── routes${groups
    .map(
        ({ groupName }, index) =>
            `${index < groups.length - 1 ? '\n│       ├── ' : '\n│       └── '}${groupName}.routes.js`
    )
    .join('')}${useEnvVar ? '\n├── .env' : ''}
├── index.js
├── package.json
└── README.md
\`\`\`
${
    dbEnabled
        ? `\n## Configuración de la Base de Datos \`${dbVariables[dbType].name}\`
| Variable | Descripción | Valor por Defecto |
|-|:-|:-|
${dbVariables[dbType].variables.map(({ envVariable, variable, description, defaultValue }) => `| \`${useEnvVar ? envVariable : variable}\` | ${description} | \`${defaultValue}\` |`).join('\n')}
${
    useEnvVar
        ? '\n* **NOTA**: Las credenciales de la base de datos deben ser configuradas en las variables de entorno utilizadas, se encuentran definidas en el archivo [\`.env\`](./.env).\n'
        : '\n* **NOTA**: Las credenciales de la base de datos deben ser configuradas en el conector, definido en el archivo [\`src/configurations/database.config.js\`](./src/configurations/database.config.js).\n'
}`
        : ''
}
## Tecnologías
* **NOTA**: Las dependencias utilizadas se encuentran definidas en el archivo [\`package.json\`](./package.json).

### Dependencias
${Object.entries(dependencies)
    .map(
        ([dep, version]) =>
            `- ${dep.charAt(0).toUpperCase()}${dep.slice(1)}: \`${version.replace('^', '')}\``
    )
    .join('\n')}

### Dependencias de Desarrollo
${Object.entries(devDependencies)
    .map(
        ([dep, version]) =>
            `- ${dep.charAt(0).toUpperCase()}${dep.slice(1)}: \`${version.replace('^', '')}\``
    )
    .join('\n')}`;
