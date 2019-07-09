const {GraphQLServer} = require('graphql-yoga');
const {Prisma} = require('prisma-binding');

// Cargamos .env
const dotenv = require('dotenv');
dotenv.config();

const {prisma} = require('./../prisma/generated/prisma-client');

const resolvers = {
    Query: {
        paises: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.paises
            });
        },
        pais: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.pais
            });
        },
        provincias: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.provincias
            });
        },
        provincia: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.provincia
            });
        },
        localidads: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.localidads
            });
        },
        localidad: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.localidad
            });
        },
        departamentoes: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.departamentoes
            });
        },
        departamento: (_, args, context) => {
            const result = resolveGraphql(context.request);
            return result.then(data => {
                return data.departamento
            });
        },
    },
};

/**
 * Realiza la llamada GraphQL al servidor Pisma
 * @param request
 * @returns {Promise<*>}
 */
function resolveGraphql(request) {
    return prisma.$graphql(request.body.query, request.body.variables);
}

const prismaEndpoint = `${process.env.PRISMA_ENDPOINT}`;

const server = new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers,
    context: req => ({
        ...req,
        prisma: new Prisma({
            typeDefs: 'src/generated/prisma.graphql',
            endpoint: prismaEndpoint,
        }),
    }),
});

server.start({
    port: process.env.APP_PORT
}, () => {
    console.log(`🚀 GraphQL APP is running on http://localhost:${process.env.APP_PORT}`);
    console.log(`🚀 GraphQL Prisma is running on ${prismaEndpoint}`);
});