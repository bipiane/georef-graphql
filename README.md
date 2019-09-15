# API GraphQL del Servicio de Normalización de Datos Geográficos de Argentina

[![lifecycle](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)

georef-graphql es un proyecto que implementa una API GraphQL de los datos importados de la API REST de [georef-ar](https://datosgobar.github.io/georef-ar-api/).

**georef-ar**: API del Servicio de Normalización de Datos Geográficos, permite normalizar y codificar los nombres de unidades territoriales de la Argentina (provincias, departamentos, municipios y localidades) y de sus calles, así como ubicar coordenadas dentro de ellas.

### Tools
- [NodeJS](https://nodejs.org/)
- [GraphQL](https://graphql.org/)
- [Prisma2](https://www.prisma.io/)
- [Nexus](https://nexus.js.org/)
- [MySQL](https://www.mysql.com/) 

### Setup
```sh
  $ npm install -g prisma2  
```
```sh
  $ npm install   
```
```sh
  # Environment: Copy .envrc.dist and edit .envrc
  $ cp .envrc.dist .envrc  
```
```sh
  # Edit prisma/schema.prisma and run Prisma2
  $ prisma2 dev  
```

### Seed Países y Provincias
```sh
  $ npm run seed  
```

### Import Georef AR
```sh
  $ npm run import  
```

### Server Nexus App
```sh
  $ npm run start  
```

### Playground App
```sh
  # Edit .graphqlconfig.yml and run
  $ graphql playground  
```
