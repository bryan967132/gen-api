const getParams = (parameterType, params) => {
    if (parameterType !== 'none') {
        return `\n    const { ${params.join(', ')} } = req.${parameterType === 'route' ? 'params' : parameterType};\n`;
    }
    return '';
};

const getResponseFields = ({ key, value }) =>
    `${key}: ${['{}', '[]', '()'].includes(value) ? value : `'${value}'`}`;

const generateControllerCode = (
    {
        method,
        path,
        basePath,
        name,
        parameterType,
        params,
        successResponse,
        errorResponse,
        parentRoute,
    },
    getName,
    getRelativePath
) => {
    const nameFunction = getName(path, method);
    return {
        nameFunction,
        method,
        parameterType,
        params,
        successResponse,
        errorResponse,
        path: getRelativePath({ parentRoute, path, parameterType, params }),
        content: `export const ${nameFunction} = (req, res) => {${getParams(parameterType, params)}
    try {
        res.status(${successResponse.statusCode}).json({ ${successResponse.fields.map(item => getResponseFields(item)).join(', ')} });
    } catch (error) {
        res.status(${errorResponse.statusCode}).json({ ${errorResponse.fields.map(item => getResponseFields(item)).join(', ')} });
    }
};`,
    };
};

export const generateControllerGroup = ({ endpoints }, getName, getRelativePath) =>
    endpoints.map(endpoint => generateControllerCode(endpoint, getName, getRelativePath));
