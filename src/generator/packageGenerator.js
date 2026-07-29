import { execSync } from 'node:child_process';

const dbDependency = {
    mysql: 'mysql2',
    oracle: 'oracledb',
    postgresql: 'pg',
};

const versions = packages =>
    Object.fromEntries(
        packages.map(pkg => [
            pkg,
            '^' +
                execSync(`pnpm view ${pkg} version`, {
                    encoding: 'utf8',
                }).trim(),
        ])
    );

const getPackageContent = (name, description, dependencies) => ({
    name: 'mi-api',
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
    dependencies: versions(dependencies),
    devDependencies: versions(['nodemon']),
});

export const generatePackage = (projectName, description, useEnvVar, { enabled, type }) => {
    let dependencies = ['cors', 'express'];
    if (useEnvVar) dependencies.push('dotenv');
    if (enabled) dependencies.push(dbDependency[type] || type);

    return JSON.stringify(getPackageContent(projectName, description, dependencies), null, 2);
};
