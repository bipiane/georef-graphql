// Cargamos .env
const dotenv = require('dotenv');
dotenv.config();

const {prisma} = require('../generated/prisma-client');
const paisesJSON = require('./paises.json');
const provinciasJSON = require('./provincia.json');

async function main() {

    let premises = [];
    console.log('Países...');
    paisesJSON.forEach(p => {
        console.log(`   ${p.nombre}`);
        premises.push(seedPais(p));
    });
    await Promise.all(premises);

    console.log('Provincias...');
    provinciasJSON.forEach(prov => {
        console.log(`   ${prov.nombre}`);
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
            nombre: data.nombre,
            activo: data.activo
        });
    } else {
        return await prisma.updatePais({
            data: {
                nombre: data.nombre,
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
            nombre: data.nombre,
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
                nombre: data.nombre,
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
