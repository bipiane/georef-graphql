const axios = require('axios');

// Cargamos .env
const dotenv = require('dotenv');
dotenv.config();

const {prisma} = require('./../../prisma/generated/prisma-client');

/**
 * Import de Georef AR
 * @see https://datosgobar.github.io/georef-ar-api/
 * @see http://servicios.infoleg.gob.ar/infolegInternet/resaltaranexos/320000-324999/320992/res55-02.pdf
 * @returns {Promise<*>}
 */
async function main() {
    console.log(`🚀 Comenzamos a importar datos de Georef-AR...`);

    // Anular todas las localidades argentinas activas
    await prisma.updateManyLocalidads({
        data: {activo: false},
        where: {activo: true, provincia: {pais: {codigo: "AR"}}}
    }).then(resp => {
        if (resp.count > 0) {
            console.log('Localidades Argentinas anuladas:', resp.count)
        }
    });

    // Obtenemos y guardamos todos los departamentos
    console.log(`🏢 Importando departamentos...`);
    await guardarDepartamentos();

    // Obtenemos y guardamos todas las localidades
    console.log(`📍 Importando localidades...`);
    return await guardarLocalidades();
}

/**
 * Permite consultar recursivamente todos los departamentos de Georef-AR y
 * guardarlas en la base de datos
 * @param inicio
 * @returns {*}
 */
function guardarDepartamentos(inicio = 0) {
    return buscarDepartamentos(inicio)
        .then(data => {
            let promises = [];
            // Guardamos todos los departamentos
            data.departamentos.forEach(deptoData => {
                promises.push(saveUpdateDepartamento(deptoData))
            });

            return Promise.all(promises).then(() => {
                // Luego de guardar todas las localidades verificamos que existan más para guardar
                let cantidad = data.cantidad;
                inicio = data.inicio;
                let total = data.total;

                // Si existen más localidades sigo guardando
                if (inicio + cantidad < total && data.departamentos.length) {
                    return guardarDepartamentos(inicio + cantidad);
                }
            });
        });
}

/**
 * Permite consultar recursivamente todas las localidades de Georef-AR y
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

            return Promise.all(promises).then(() => {
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
 * * Crea o actualiza departamentos en la base de datos
 * @param data
 * @returns {Promise<void>}
 */
async function saveUpdateDepartamento(data) {
    const idDepartamento = data.id;
    const idProvincia = data.provincia.id;

    const existDepto = await prisma.$exists.departamento({
        codigo_indec: idDepartamento
    });

    let dataDepto = {
        nombre: data.nombre,
        provincia: {
            connect: {
                codigo_indec: idProvincia
            }
        },
    };

    // Creamos o actualizamos el departamento
    if (!existDepto) {
        dataDepto.codigo_indec = idDepartamento;
        return await prisma.createDepartamento(dataDepto);
    } else {
        return await prisma.updateDepartamento({
            data: dataDepto,
            where: {
                codigo_indec: idDepartamento
            }
        });
    }
}

/**
 * Crea o actualiza localidades en la base de datos
 * @param data
 * @returns {Promise<void>}
 */
async function saveUpdateLocalidad(data) {
    const idLocalidad = data.id;
    const idDepartamento = data.departamento.id;
    const idProvincia = data.provincia.id;

    const existLocalidad = await prisma.$exists.localidad({
        codigo_indec: idLocalidad
    });

    let dataLocalidad = {
        nombre: data.nombre,
        lat: data.centroide.lat,
        lon: data.centroide.lon,
        provincia: {
            connect: {
                codigo_indec: idProvincia
            }
        },
        activo: true
    };

    // Si la localidad tiene departamento, los relacionamos
    if (idDepartamento) {
        dataLocalidad.departamento = {
            connect: {
                codigo_indec: idDepartamento
            }
        }
    }

    // Creamos o actualizamos la localidad
    if (!existLocalidad) {
        dataLocalidad.codigo_indec = idLocalidad;
        return await prisma.createLocalidad(dataLocalidad);
    } else {
        return await prisma.updateLocalidad({
            data: dataLocalidad,
            where: {
                codigo_indec: idLocalidad
            }
        });
    }
}

/**
 * Obtiene los departamentos de Georef-AR.
 * @param inicio
 * @param max
 * @param orden
 * @returns {*}
 */
function buscarDepartamentos(inicio = 0, max = 500, orden = 'id') {
    const url = `https://apis.datos.gob.ar/georef/api/departamentos?orden=${orden}&max=${max}&inicio=${inicio}`;

    console.log('   =>', url);
    return axios.get(url)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log('💀 Error al consultar departamentos de API Georef-AR!!!');
            throw error;
        });
}

/**
 * Obtiene las localidades de Georef-AR.
 * @param inicio
 * @param max
 * @param orden
 * @returns {Promise<*>}
 */
function buscarLocalidades(inicio = 0, max = 500, orden = 'id') {
    const url = `https://apis.datos.gob.ar/georef/api/localidades?orden=${orden}&max=${max}&inicio=${inicio}`;

    console.log('   =>', url);
    return axios.get(url)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log('💀 Error al consultar localidades de API Georef-AR!!!');
            throw error;
        });
}

main()
    .then(() => {
        console.log('👍 Import finalizado!!!');
    })
    .catch(e => {
        console.error(e);
        console.log('🐛 !!!Error al procesar import!!! 🐛');
    });