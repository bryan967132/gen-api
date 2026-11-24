export const basicData = [
    {
        type: 'route',
        name: 'Usuarios',
        path: '/usuarios',
        subRoutes: [],
        endpoints: [
            {
                type: 'endpoint',
                method: 'GET',
                path: '/login',
                parameterType: 'query',
                params: ['email', 'password'],
                successResponse: {
                    statusCode: 200,
                    fields: [
                        {
                            key: 'message',
                            value: 'Success',
                        },
                        {
                            key: 'data',
                            value: '{}',
                        },
                    ],
                },
                errorResponse: {
                    statusCode: 500,
                    fields: [
                        {
                            key: 'error',
                            value: 'Something went wrong',
                        },
                    ],
                },
            },
            {
                type: 'endpoint',
                method: 'POST',
                path: '/registro',
                parameterType: 'body',
                params: ['name', 'email', 'password'],
                successResponse: {
                    statusCode: 200,
                    fields: [
                        {
                            key: 'message',
                            value: 'Success',
                        },
                        {
                            key: 'data',
                            value: '{}',
                        },
                    ],
                },
                errorResponse: {
                    statusCode: 500,
                    fields: [
                        {
                            key: 'error',
                            value: 'Something went wrong',
                        },
                    ],
                },
            },
        ],
    },
];
