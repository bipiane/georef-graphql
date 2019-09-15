import Photon from '@generated/photon'
import axios from 'axios'

interface GeorefAPIGobAR {
    inicio: number;
    cantidad: number;
    localidades: LocalidadData[];
    departamentos: DepartamentoData[];
    total: number;
}

interface LocalidadData {
    id: string;
    nombre: string;
    provincia: {
        id: string;
    };
    centroide: {
        lat: number;
        lon: number;
    };
}

interface DepartamentoData {
    id: string;
    nombre: string;
    provincia: {
        id: string;
    };
    centroide: {
        lat: number;
        lon: number;
    };
}

const photon = new Photon();

/**
 * Import de Georef AR
 * @see https://datosgobar.github.io/georef-ar-api/
 * @see http://servicios.infoleg.gob.ar/infolegInternet/resaltaranexos/320000-324999/320992/res55-02.pdf
 */
async function imports() {
    console.log(`🚀 Comenzamos a importar datos de Georef-AR...`);
    await photon.connect();

    console.log(`⛔ Anulamos localidades y departamentos activos`);
    await anularRecursos();

    console.log(`🏢 Importando departamentos...`);
    await guardarDepartamentos();

    console.log(`📍 Importando localidades...`);
    await guardarLocalidades();

    await photon.disconnect()
}

/**
 * Permite anular todas las localidades y departamentos activos
 * antes de que se ejecute una reimportación
 */
async function anularRecursos() {
    // Anular todas las localidades argentinas activas
    await photon.cities.updateMany({
        data: {active: false},
        where: {
            active: true,
            province: {
                country: {
                    iso_code: 'AR'
                }
            }
        }
    }).then(resp => {
        if (resp.count > 0) {
            console.log('   Localidades argentinas anuladas:', resp.count)
        }
    });

    // Anular todos los departamentos argentinos activos
    await photon.departments.updateMany({
        data: {active: false},
        where: {
            active: true,
            province: {
                country: {
                    iso_code: 'AR'
                }
            }
        }
    }).then(resp => {
        if (resp.count > 0) {
            console.log('   Departamentos argentinos anulados:', resp.count)
        }
    });
}

/**
 * Permite consultar recursivamente todas las localidades de Georef-AR y
 * guardarlas en la base de datos
 * @param inicio
 */
function guardarLocalidades(inicio = 0): Promise<any> {
    return fetchGeorefAR('localidades', inicio)
        .then(async (data: GeorefAPIGobAR) => {

            for (const newData of data.localidades) {
                const formData = {
                    code: newData.id,
                    name: newData.nombre,
                    active: true,
                    province: {
                        connect: {
                            code: newData.provincia.id
                        }
                    },
                    lat: newData.centroide.lat,
                    lon: newData.centroide.lon
                };

                await photon.cities.upsert({
                    update: formData,
                    create: formData,
                    where: {
                        code: newData.id,
                    }
                });
            }

            if (data.inicio + data.cantidad < data.total && data.localidades.length > 0) {
                return guardarLocalidades(data.inicio + data.cantidad);
            }
        });
}

/**
 * Permite consultar recursivamente todos los departamentos de Georef-AR y
 * guardarlos en la base de datos
 * @param inicio
 */
function guardarDepartamentos(inicio = 0): Promise<any> {
    return fetchGeorefAR('departamentos', inicio, 100)
        .then(async (data: GeorefAPIGobAR) => {

            for (const newData of data.departamentos) {
                const formData = {
                    code: newData.id,
                    name: newData.nombre,
                    active: true,
                    province: {
                        connect: {
                            code: newData.provincia.id
                        }
                    }
                };

                await photon.departments.upsert({
                    update: formData,
                    create: formData,
                    where: {
                        code: newData.id,
                    }
                });
            }

            if (data.inicio + data.cantidad < data.total && data.departamentos && data.departamentos.length > 0) {
                return guardarDepartamentos(data.inicio + data.cantidad);
            }
        });
}


/**
 * Obtiene un recurso de API Georef-AR.
 * El recurso puede ser:
 *  - localidades
 *  - departamentos
 * @param recurso
 * @param inicio
 * @param max
 * @param orden
 */
function fetchGeorefAR(recurso = 'localidades', inicio = 0, max = 500, orden = 'id'): Promise<GeorefAPIGobAR> {
    const url = `https://apis.datos.gob.ar/georef/api/${recurso}?orden=${orden}&max=${max}&inicio=${inicio}`;

    console.log('   =>', url);
    return axios.get(url).then(response => {
        return response.data;
    }).catch(error => {
        console.log(`💀 Error al consultar '${recurso}' de API Georef-AR!!!`);
        throw error;
    });
}

imports()
    .then(() => {
        console.log('👍 Import finalizado!!!');
    })
    .catch(e => {
        console.error(e);
        console.log('🐛 !!!Error al procesar import!!! 🐛');
    });
