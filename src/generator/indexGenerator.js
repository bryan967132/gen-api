const getImportRoutes = groups =>
    groups
        .map(({ groupName }) => `import ${groupName} from './src/routes/${groupName}.routes.js';`)
        .join('\n') + (groups.length ? '\n' : '');

const getUseRoutes = (groups, jump) =>
    (jump = groups.length > 0 ? '\n' : '') +
    groups.map(({ groupName, path }) => `app.use('${path}', ${groupName});`).join('\n') +
    jump;

export const generateIndex = (useEnvVar, port, groups) => {
    return `${useEnvVar ? `import 'dotenv/config';\n` : ''}import express from 'express';
import cors from 'cors';
${getImportRoutes(groups)}
const app = express();

app.use(cors());
app.use(express.json());
${getUseRoutes(groups)}
const API_PORT = ${useEnvVar ? 'process.env.API_PORT || 3000' : port};
app.listen(API_PORT, () => {
    console.log(\`Servidor ejecutándose en http://localhost:\${API_PORT}\`);
});`;
};
