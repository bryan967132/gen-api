const getImport = (groupName, group) =>
    `import {${group.map(g => `\n    ${g.nameFunction}`).join(',')}
} from '../controllers/${groupName}.controller.js'\n`;

const getHTTPMethods = group =>
    group
        .map(
            ({ method, path, nameFunction }) =>
                `\nrouter.${method.toLowerCase()}('${path}', ${nameFunction});`
        )
        .join('') + '\n';

export const generateRouterGroup = (groupName, endpointGroup) =>
    `import { Router } from 'express'
${getImport(groupName, endpointGroup)}
const router = Router();
${getHTTPMethods(endpointGroup)}
export default router;`;
