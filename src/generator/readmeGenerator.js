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
            `${index < groups.length - 1 ? '\n│   │   ├── ' : '\n│   │   └── '}${groupName}.controller.json`
    )
    .join('')}
│   └── routes${groups
    .map(
        ({ groupName }, index) =>
            `${index < groups.length - 1 ? '\n│       ├── ' : '\n│       └── '}${groupName}.routes.json`
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
