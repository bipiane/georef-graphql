const axios = require('axios');
const {prisma} = require('./../../prisma/generated/prisma-client');

// Cargamos .env
const dotenv = require('dotenv');
dotenv.config();

async function main() {
    console.log(`🚀 Comenzamos a importar localidades de Modernización...`);

    // Anular todas las localidades argentinas activas
    await prisma.updateManyLocalidads({
        data: {activo: false},
        where: {activo: true, provincia: {pais: {codigo: "AR"}}}
    }).then(resp => {
        console.log('Localidades Argentinas anuladas:', resp.count)
    });

    // Obtenemos y guardamos todas las localidades
    return guardarLocalidades();
}

/**
 * Permite consultar recursivamente todas las localidades de Modernización y
 * guardarlas en la base de datos
 * @param inicio
 * @returns {Promise<*>}
 */
function guardarLocalidades(inicio = 0) {
    return buscarLocalidades(inicio)
        .then(data => {
            let promises = [];
            // Guardamos todas las localidadess
            data.localidades.forEach(locData => {
                promises.push(saveUpdateLocalidad(locData))
            });

            Promise.all(promises).then(() => {
                // Luego de guardar todas las localidades verificamos que existan más para guardar
                let cantidad = data.cantidad;
                inicio = data.inicio;
                let total = data.total;

                // Si existen más localidades sigo guardando
                if (inicio + cantidad < total && data.localidades.length) {
                    return guardarLocalidades(inicio + cantidad);
                }
            });
        });
}

/**
 * Crea o actualiza localides en la base de datos
 * @param data
 * @returns {Promise<void>}
 */
async function saveUpdateLocalidad(data) {
    const userExists = await prisma.$exists.localidad({
        codigo_indec: data.id
    });

    if (!userExists) {
        return await prisma.createLocalidad({
            codigo_indec: data.id,
            descripcion: data.nombre,
            lat: data.centroide.lat,
            lon: data.centroide.lon,
            provincia: {
                connect: {
                    codigo_indec: data.provincia.id
                }
            },
            activo: true
        });
    } else {
        return await prisma.updateLocalidad({
            data: {
                descripcion: data.nombre,
                lat: data.centroide.lat,
                lon: data.centroide.lon,
                provincia: {
                    connect: {
                        codigo_indec: data.provincia.id
                    }
                },
                activo: true
            },
            where: {
                codigo_indec: data.id
            }
        });
    }
}

/**
 * Obtiene las localidades del Ministerio de Modernización
 * @param inicio
 * @param max
 * @param orden
 * @returns {Promise<*>}
 */
function buscarLocalidades(inicio = 0, max = 500, orden = 'id') {
    const url = `https://apis.datos.gob.ar/georef/api/localidades?orden=${orden}&max=${max}&inicio=${inicio}`;

    console.log(url);
    return axios.get(url)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log('Error al consultar API Modernización: ', error);
            throw error;
        });
}

main()
    .then(() => {
        console.log('👍 Import finalizado!');
    })
    .catch(e => {
        console.log('🐛 Error al procesar import!');
        console.error(e);
    });