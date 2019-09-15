import Photon from '@generated/photon'
import {nexusPrismaPlugin} from '@generated/nexus-prisma'
import {makeSchema, objectType, stringArg} from 'nexus'
import {GraphQLServer} from 'graphql-yoga'
import {join} from 'path'
import {Context} from './types'

const photon = new Photon();

/**
 * Doc:
 * https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5
 */
const nexusPrisma = nexusPrismaPlugin({
    photon: (ctx: Context) => ctx.photon,
});

const Country = objectType({
    name: 'Country',
    description: "País",
    definition(t) {
        t.model.id();
        t.model.iso_code();
        t.model.name();
        t.model.active();
        t.model.provincies({
            alias: 'provincias',
            filtering: true,
        })
    },
});

const Province = objectType({
    name: 'Province',
    description: "Provincia",
    definition(t) {
        t.model.id();
        t.model.code();
        t.model.iso_code();
        t.model.country();
        t.model.name();
        t.model.active();
        t.model.cities({
            alias: 'ciudades',
            filtering: true,
        });
        t.model.departments({
            alias: 'departamentos',
            filtering: true,
        });
    },
});

const Ciudad = objectType({
    name: 'City',
    description: "Ciudad",
    definition(t) {
        t.model.id();
        t.model.code();
        t.model.name();
        t.model.province();
        t.model.lat();
        t.model.lon();
        t.model.active();
    },
});

const Departamento = objectType({
    name: 'Department',
    description: "Departamento",
    definition(t) {
        t.model.id();
        t.model.code();
        t.model.name();
        t.model.province();
        t.model.active();
    },
});

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.crud.country({
            alias: 'pais',
        });
        t.crud.countries({
            alias: 'paises',
            filtering: true,
        });
        t.crud.province({
            alias: 'provincia',
        });
        t.crud.provinces({
            alias: 'provincias',
            filtering: true,
        });
        t.crud.city({
            alias: 'ciudad',
        });
        t.crud.cities({
            alias: 'ciudades',
            filtering: true,
        });
        t.crud.department({
            alias: 'departamento',
        });
        t.crud.departments({
            alias: 'departamentos',
            filtering: true,
        });
        // Custom methods
        t.list.field('filterPaises', {
            type: 'Country',
            description: 'Búsqueda de países por código ISO o nombre',
            args: {
                searchString: stringArg({nullable: true}),
            },
            resolve: (_, {searchString}, ctx) => {
                return ctx.photon.countries.findMany({
                    where: {
                        OR: [
                            {name: {contains: searchString}},
                            {iso_code: {contains: searchString}},
                        ],
                    },
                })
            },
        });
    },
});

const schema = makeSchema({
    types: [Query, Country, Province, Ciudad, Departamento, nexusPrisma],
    outputs: {
        typegen: join(__dirname, '../generated/nexus-typegen.ts'),
        schema: join(__dirname, '../generated/schema.graphql'),
    },
    typegenAutoConfig: {
        sources: [
            {
                source: '@generated/photon',
                alias: 'photon',
            },
            {
                source: join(__dirname, 'types.ts'),
                alias: 'ctx',
            },
        ],
        contextType: 'ctx.Context',
    },
});

const server = new GraphQLServer({
    schema,
    context: {photon},
});

server.start({
    port: process.env.APP_PORT
}).then(() => {
    console.log(`🚀 GraphQL APP is running on http://localhost:${process.env.APP_PORT}`);
}).catch(e => {
    console.log('🐛 Server Error!');
    console.error(e);
});
