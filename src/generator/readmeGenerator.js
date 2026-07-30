export const generateREADME = (name, useEnvVar, groups) => `
# ${name}

## Preparación del Entorno
\`\`\`sh
# Instalación de Dependencias
# npm
npm install

# pnpm
pnpm install
\`\`\`

## Estructura del Proyecto
\`\`\`
${name.trim().toLowerCase().replace(/\s+/, '-')}
├── src${useEnvVar ? '\n│   ├── configurations\n│   │   └── db.js' : ''}
│   ├── controllers${groups
    .map(
        (group, index) =>
            `${index < groups.length - 1 ? '\n│   │   ├── ' : '\n│   │   └── '}${group}.controller.json`
    )
    .join('\n')}
│   └── routes${groups
    .map(
        (group, index) =>
            `${index < groups.length - 1 ? '\n│       ├── ' : '\n│       └── '}${group}.route.json`
    )
    .join('\n')}
├── index.js
├── package.json
└── README.md
\`\`\`
`;
