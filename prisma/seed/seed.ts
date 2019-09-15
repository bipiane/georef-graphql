import Photon from '@generated/photon'

interface CountryData {
    iso_code: string;
    name: string;
}

interface ProvinceData {
    iso_code: string;
    code: string;
    name: string;
    country_iso: string;
}

// @ts-ignore
const paisesJSON: CountryData[] = require('./paises.json');
let provinciasJSON: ProvinceData[] = [];

// Cargamos seeds de provincias
const dirProvincias = __dirname + '/provincias/';
require('fs').readdirSync(dirProvincias).forEach((filename: string) => {
    if (filename.match(/\.json$/) !== null) {
        const fullPath = dirProvincias + filename;
        const jsonFile: ProvinceData[] = require(fullPath);
        provinciasJSON = provinciasJSON.concat(jsonFile);
    }
});

const photon = new Photon();

async function seed() {
    // Open connection to database
    await photon.connect();

    console.log('🚀 Countries...');
    for (const countryData of paisesJSON) {
        console.log(`   ${countryData.name}`);

        const formData = {
            iso_code: countryData.iso_code,
            name: countryData.name,
            active: true,
        };
        await photon.countries.upsert({
            update: formData,
            create: formData,
            where: {
                iso_code: countryData.iso_code
            }
        });
    }

    console.log('🚀 Provinces...');
    for (const provData of provinciasJSON) {
        console.log(`   ${provData.name} [${provData.country_iso}]`);

        const formData = {
            iso_code: provData.iso_code,
            code: provData.code ? provData.code : provData.iso_code,
            name: provData.name,
            active: true,
            country: {
                connect: {
                    iso_code: provData.country_iso
                }
            }
        };
        await photon.provinces.upsert({
            update: formData,
            create: formData,
            where: {
                iso_code: provData.iso_code
            }
        })
    }

    // Close connection to database
    await photon.disconnect()
}

seed()
    .then(() => {
        console.log('👍 Seed OK!');
    })
    .catch(e => {
        console.log('🐛 Seed error!');
        console.error(e);
    });
