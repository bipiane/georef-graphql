const {GraphQLServer} = require('graphql-yoga');
const {Prisma} = require('prisma-binding');

// Cargamos .env
const dotenv = require('dotenv');
dotenv.config();

const resolvers = {
    Query: {
        paises: (_, args, context, info) => {
            return context.prisma.query.paises(args, info,)
        },
        pais: (_, args, context, info) => {
            return context.prisma.query.pais(args, info,)
        },
        provincias: (_, args, context, info) => {
            return context.prisma.query.provincias(args, info,)
        },
        provincia: (_, args, context, info) => {
            return context.prisma.query.provincia(args, info,)
        },
        localidades: (_, args, context, info) => {
            return context.prisma.query.localidads(args, info,)
        },
        localidad: (_, args, context, info) => {
            return context.prisma.query.localidad(args, info,)
        },
    },
};

const prismaEndpoint = `http://localhost:${process.env.PRISMA_PORT}`;//'__YOUR_PRISMA_ENDPOINT__',

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