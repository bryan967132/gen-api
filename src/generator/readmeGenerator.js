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

const codeResponse = {
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

const getResponse = (successResponse, errorResponse) => `\n* **Response**:
    * ${codeResponse[successResponse.statusCode]}
    \`\`\`json
    {
${successResponse.fields.map(({ key, value }) => `        "${key}": ${['{}', '[]', '()'].includes(value) ? value : `"${value}"`}`).join(',\n')}
    }
    \`\`\`
    * ${codeResponse[errorResponse.statusCode]}
    \`\`\`json
    {
${errorResponse.fields.map(({ key, value }) => `        "${key}": ${['{}', '[]', '()'].includes(value) ? value : `"${value}"`}`).join(',\n')}
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
    dbEnabled,
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
