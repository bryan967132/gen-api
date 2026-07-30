const dbDependency = {
    mysql: 'mysql2',
    oracle: 'oracledb',
    postgresql: 'pg',
};

const getLatestVersion = async packageName => {
    const response = await fetch(
        `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`
    );

    if (response.ok) {
        const { version } = await response.json();
        return `^${version}`;
    }

    return '*';
};

const versions = async packages =>
    Object.fromEntries(
        await Promise.all(packages.map(async pkg => [pkg, await getLatestVersion(pkg)]))
    );

const getPackageContent = async (name, description, dependencies) => ({
    name: name.trim().toLowerCase().replaceAll(/\s+/g, '-'),
    version: '1.0.0',
    description,
    main: 'index.js',
    scripts: {
        dev: 'nodemon index.js',
        start: 'node index.js',
    },
    keywords: [],
    author: '',
    license: 'ISC',
    type: 'module',
    dependencies: await versions(dependencies),
    devDependencies: await versions(['nodemon']),
});

export const generatePackage = async (projectName, description, useEnvVar, { enabled, type }) => {
    let dependencies = ['cors', 'express'];
    if (useEnvVar) dependencies.push('dotenv');
    if (enabled) dependencies.push(dbDependency[type] || type);

    const content = await getPackageContent(projectName, description, dependencies);
    return {
        content: JSON.stringify(content, null, 2),
        dependencies: content.dependencies,
        devDependencies: content.devDependencies,
    };
};
