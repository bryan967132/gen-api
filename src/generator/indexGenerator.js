const getImportRoutes = groups =>
    groups
        .map(({ groupName }) => `import ${groupName} from './routes/${groupName}.route.js';`)
        .join('\n') + (groups.length ? '\n' : '');

const getUseRoutes = (groups, jump) =>
    (jump = groups.length > 0 ? '\n' : '') +
    groups.map(({ groupName, path }) => `app.use('${path}', ${groupName});`).join('\n') +
    jump;

export const generateIndex = groups => {
    return `import express from 'express';
import cors from 'cors';
${getImportRoutes(groups)}
const app = express();

app.use(cors())
app.use(express.json());
${getUseRoutes(groups)}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`Servidor ejecutándose en http://localhost:\${PORT}\`);
});`;
};
