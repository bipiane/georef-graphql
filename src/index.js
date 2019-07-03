const {GraphQLServer} = require('graphql-yoga');
const {Prisma} = require('prisma-binding');

// Cargamos .env
const dotenv = require('dotenv');
dotenv.config();

const {prisma} = require('./../prisma/generated/prisma-client');

const resolvers = {
    Query: {
        paises: (_, args) => {
            return prisma.paises(args);
        },
        pais: (_, args) => {
            return prisma.pais(args.where);
        },
        provincias: (_, args) => {
            return prisma.provincias(args);
        },
        provincia: (_, args) => {
            return prisma.provincia(args.where);
        },
        localidades: (_, args) => {
            return prisma.localidads(args);
        },
        localidad: (_, args) => {
            return prisma.localidad(args.where);
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