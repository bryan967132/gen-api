const paramType = {
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

const getResponse = (successResponse, errorResponse) => `\n* **Response**:
    * OK: ${successResponse.statusCode}
    \`\`\`json
    {
${successResponse.fields.map(({ key, value }) => `        "${key}": ${value}`).join(',\n')}
    }
    \`\`\`
    * ERROR: ${errorResponse.statusCode}
    \`\`\`json
    {
${errorResponse.fields.map(({ key, value }) => `        "${key}": ${value}`).join(',\n')}
    }
    \`\`\``;

const getRequest = (parameterType, path, params, param) =>
    parameterType !== 'none'
        ? `\n* **${(param = paramType[parameterType]).alias}**:
\`\`\`${param.buildExample(path, params)}\`\`\``
        : '\n* **Sin Parametros**';

const getEndpoints = (path, docController) =>
    docController
        .map(
            ({ method, parameterType, params, path: localPath, successResponse, errorResponse }) =>
                `\n**${method}** \`${path}${localPath}\`${getRequest(
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
${name.trim().toLowerCase().replace(/\s+/, '-')}
├── src${useEnvVar ? '\n│   ├── configurations\n│   │   └── database.config.js' : ''}
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
    .join('')}
├── index.js
├── package.json
└── README.md
\`\`\`

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
