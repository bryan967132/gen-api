export const basicProject = [
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
                    statusCode: '201',
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

export const libraryProject = [
    {
        type: 'route',
        name: 'Libros',
        path: '/libros',
        subRoutes: [
            {
                type: 'route',
                name: 'Categorias',
                path: '/categorias',
                subRoutes: [],
                endpoints: [
                    {
                        type: 'endpoint',
                        method: 'GET',
                        path: '/listar-categorias',
                        parameterType: 'query',
                        params: ['name'],
                        successResponse: {
                            statusCode: '200',
                            fields: [
                                { key: 'message', value: 'Categories Found' },
                                { key: 'data', value: 'Categories List' },
                            ],
                        },
                        errorResponse: {
                            statusCode: '500',
                            fields: [{ key: 'error', value: 'Failed to Get Categories' }],
                        },
                    },
                    {
                        type: 'endpoint',
                        method: 'POST',
                        path: '/crear-categoria',
                        parameterType: 'body',
                        params: ['name', 'description'],
                        successResponse: {
                            statusCode: '201',
                            fields: [{ key: 'message', value: 'Category Created' }],
                        },
                        errorResponse: {
                            statusCode: '400',
                            fields: [{ key: 'error', value: 'Invalid Category Data' }],
                        },
                    },
                ],
            },
        ],
        endpoints: [
            {
                type: 'endpoint',
                method: 'GET',
                path: '/listar-libros',
                parameterType: 'query',
                params: ['title', 'author', 'category'],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'Books Found' },
                        { key: 'data', value: 'Books List' },
                    ],
                },
                errorResponse: {
                    statusCode: '500',
                    fields: [{ key: 'error', value: 'Failed to Get Books' }],
                },
            },
            {
                type: 'endpoint',
                method: 'GET',
                path: '/buscar-libro',
                parameterType: 'route',
                params: ['id'],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'Book Found' },
                        { key: 'data', value: 'Book Details' },
                    ],
                },
                errorResponse: {
                    statusCode: '404',
                    fields: [{ key: 'error', value: 'Book Not Found' }],
                },
            },
            {
                type: 'endpoint',
                method: 'POST',
                path: '/registrar-libro',
                parameterType: 'body',
                params: ['title', 'authorId', 'categoryId', 'isbn', 'publicationYear', 'quantity'],
                successResponse: {
                    statusCode: '201',
                    fields: [{ key: 'message', value: 'Book Registered' }],
                },
                errorResponse: {
                    statusCode: '422',
                    fields: [{ key: 'error', value: 'Invalid Book Data' }],
                },
            },
            {
                type: 'endpoint',
                method: 'PUT',
                path: '/actualizar-libro',
                parameterType: 'body',
                params: ['id', 'title', 'categoryId', 'quantity'],
                successResponse: {
                    statusCode: '200',
                    fields: [{ key: 'message', value: 'Book Updated' }],
                },
                errorResponse: {
                    statusCode: '404',
                    fields: [{ key: 'error', value: 'Book Not Found' }],
                },
            },
            {
                type: 'endpoint',
                method: 'DELETE',
                path: '/eliminar-libro',
                parameterType: 'route',
                params: ['id'],
                successResponse: {
                    statusCode: '200',
                    fields: [{ key: 'message', value: 'Book Deleted' }],
                },
                errorResponse: {
                    statusCode: '409',
                    fields: [{ key: 'error', value: 'Book Cannot Be Deleted' }],
                },
            },
        ],
    },
    {
        type: 'route',
        name: 'Autores',
        path: '/autores',
        subRoutes: [],
        endpoints: [
            {
                type: 'endpoint',
                method: 'GET',
                path: '/listar-autores',
                parameterType: 'none',
                params: [],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'Authors Found' },
                        { key: 'data', value: 'Authors List' },
                    ],
                },
                errorResponse: {
                    statusCode: '503',
                    fields: [{ key: 'error', value: 'Service Unavailable' }],
                },
            },
            {
                type: 'endpoint',
                method: 'POST',
                path: '/registrar-autor',
                parameterType: 'body',
                params: ['name', 'nationality', 'birthDate'],
                successResponse: {
                    statusCode: '201',
                    fields: [{ key: 'message', value: 'Author Registered' }],
                },
                errorResponse: {
                    statusCode: '400',
                    fields: [{ key: 'error', value: 'Invalid Author Data' }],
                },
            },
        ],
    },
    {
        type: 'route',
        name: 'Prestamos',
        path: '/prestamos',
        subRoutes: [
            {
                type: 'route',
                name: 'Devoluciones',
                path: '/devoluciones',
                subRoutes: [],
                endpoints: [
                    {
                        type: 'endpoint',
                        method: 'POST',
                        path: '/registrar-devolucion',
                        parameterType: 'body',
                        params: ['loanId', 'returnDate'],
                        successResponse: {
                            statusCode: '200',
                            fields: [{ key: 'message', value: 'Book Returned' }],
                        },
                        errorResponse: {
                            statusCode: '404',
                            fields: [{ key: 'error', value: 'Loan Not Found' }],
                        },
                    },
                ],
            },
        ],
        endpoints: [
            {
                type: 'endpoint',
                method: 'GET',
                path: '/listar-prestamos',
                parameterType: 'query',
                params: ['userId', 'status'],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'Loans Found' },
                        { key: 'data', value: 'Loans List' },
                    ],
                },
                errorResponse: {
                    statusCode: '500',
                    fields: [{ key: 'error', value: 'Failed to Get Loans' }],
                },
            },
            {
                type: 'endpoint',
                method: 'POST',
                path: '/solicitar-prestamo',
                parameterType: 'body',
                params: ['userId', 'bookId', 'loanDate', 'dueDate'],
                successResponse: {
                    statusCode: '202',
                    fields: [{ key: 'message', value: 'Loan Request Accepted' }],
                },
                errorResponse: {
                    statusCode: '409',
                    fields: [{ key: 'error', value: 'Book Not Available' }],
                },
            },
            {
                type: 'endpoint',
                method: 'PATCH',
                path: '/renovar-prestamo',
                parameterType: 'body',
                params: ['loanId', 'dueDate'],
                successResponse: {
                    statusCode: '200',
                    fields: [{ key: 'message', value: 'Loan Renewed' }],
                },
                errorResponse: {
                    statusCode: '403',
                    fields: [{ key: 'error', value: 'Loan Renewal Not Allowed' }],
                },
            },
            {
                type: 'endpoint',
                method: 'GET',
                path: '/consultar-prestamos',
                parameterType: 'headers',
                params: ['x-user-id'],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'User Loans Found' },
                        { key: 'data', value: 'User Loans List' },
                    ],
                },
                errorResponse: {
                    statusCode: '401',
                    fields: [{ key: 'error', value: 'Unauthorized User' }],
                },
            },
        ],
    },
];

export const voidRoutes = [
    {
        type: 'route',
        name: 'Usuarios',
        path: '/usuarios',
        subRoutes: [],
        endpoints: [],
    },
    {
        type: 'route',
        name: 'Libros',
        path: '/libros',
        subRoutes: [],
        endpoints: [],
    },
];

export const voidDuplicatedRoutes = [
    {
        type: 'route',
        name: 'Usuarios',
        path: '/duplicado',
        subRoutes: [],
        endpoints: [],
    },
    {
        type: 'route',
        name: 'Libros',
        path: '/duplicado',
        subRoutes: [],
        endpoints: [],
    },
];

export const duplicatedEndpoints = [
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
        ],
    },
    {
        type: 'route',
        name: 'Libros',
        path: '/libros',
        subRoutes: [],
        endpoints: [
            {
                type: 'endpoint',
                method: 'GET',
                path: '/listar-libros',
                parameterType: 'query',
                params: ['title', 'author', 'category'],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'Books Found' },
                        { key: 'data', value: 'Books List' },
                    ],
                },
                errorResponse: {
                    statusCode: '500',
                    fields: [{ key: 'error', value: 'Failed to Get Books' }],
                },
            },
            {
                type: 'endpoint',
                method: 'GET',
                path: '/listar-libros',
                parameterType: 'query',
                params: ['title', 'author', 'category'],
                successResponse: {
                    statusCode: '200',
                    fields: [
                        { key: 'message', value: 'Books Found' },
                        { key: 'data', value: 'Books List' },
                    ],
                },
                errorResponse: {
                    statusCode: '500',
                    fields: [{ key: 'error', value: 'Failed to Get Books' }],
                },
            },
        ],
    },
];
