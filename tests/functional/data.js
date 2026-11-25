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
                    statusCode: '200',
                    fields: [
                        {
                            key: 'message',
                            value: 'User Logged',
                        },
                    ],
                },
                errorResponse: {
                    statusCode: '500',
                    fields: [
                        {
                            key: 'error',
                            value: 'Failed Login',
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
                    statusCode: '200',
                    fields: [
                        {
                            key: 'message',
                            value: 'User Registered',
                        },
                    ],
                },
                errorResponse: {
                    statusCode: '500',
                    fields: [
                        {
                            key: 'error',
                            value: 'Failed Register',
                        },
                    ],
                },
            },
        ],
    },
];
