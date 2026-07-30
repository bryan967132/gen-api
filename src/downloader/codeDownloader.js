import JSZip from 'jszip';

export const generateZip = async (
    name,
    { readme, envContent, packageJSON, dbConfig, groups, index }
) => {
    const zip = new JSZip();
    name = name.trim().toLowerCase().replaceAll(/\s+/g, '-');

    if (dbConfig) zip.file(`${name}/src/configurations/database.config.js`, dbConfig);
    groups.forEach(({ groupName, controller, route }) => {
        zip.file(`${name}/src/controllers/${groupName}.controller.js`, controller);
        zip.file(`${name}/src/routes/${groupName}.routes.js`, route);
    });
    if (envContent) zip.file(`${name}/.env`, envContent);
    zip.file(`${name}/index.js`, index);
    zip.file(`${name}/package.json`, packageJSON);
    zip.file(`${name}/README.md`, readme);

    const blob = await zip.generateAsync({
        type: 'blob',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.zip`;

    link.click();

    URL.revokeObjectURL(url);
};
