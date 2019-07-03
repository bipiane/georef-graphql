const {prisma} = require('../generated/prisma-client');
const paisesJSON = require('./paises.json');
const provinciasJSON = require('./provincia.json');

async function main() {

    let premises = [];
    console.log('Países...');
    paisesJSON.forEach(p => {
        console.log(`   ${p.descripcion}`);
        premises.push(seedPais(p));
    });
    await Promise.all(premises);

    console.log('Provincias...');
    provinciasJSON.forEach(prov => {
        console.log(`   ${prov.descripcion}`);
        premises.push(seedProvincia(prov));
    });

    return Promise.all(premises)
}

async function seedPais(data) {
    const exist = await prisma.$exists.pais({
        codigo: data.codigo
    });

    if (!exist) {
        return await prisma.createPais({
            codigo: data.codigo,
            descripcion: data.descripcion,
            activo: data.activo
        });
    } else {
        return await prisma.updatePais({
            data: {
                descripcion: data.descripcion,
                activo: data.activo
            },
            where: {
                codigo: data.codigo
            }
        });
    }
}

async function seedProvincia(data) {
    const exist = await prisma.$exists.provincia({
        codigo: data.codigo
    });

    if (!exist) {
        return await prisma.createProvincia({
            codigo: data.codigo,
            codigo_indec: data.codigo_indec,
            descripcion: data.descripcion,
            pais: {
                connect: {
                    id: data.pais_id
                }
            },
            activo: data.activo
        });
    } else {
        return await prisma.updateProvincia({
            data: {
                codigo: data.codigo,
                codigo_indec: data.codigo_indec,
                descripcion: data.descripcion,
                pais: {
                    connect: {
                        id: data.pais_id
                    }
                },
                activo: data.activo
            },
            where: {
                codigo: data.codigo
            }
        });
    }
}

main()
    .then(() => {
        console.log('👍 Seed OK!');
    })
    .catch(e => {
        console.log('🐛 Error al procesar seed!');
        console.error(e);
    });
