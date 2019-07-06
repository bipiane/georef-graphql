# API GraphQL del Servicio de Normalización de Datos Geográficos de Argentina

[![lifecycle](https://img.shields.io/badge/lifecycle-experimental-orange.svg)](https://www.tidyverse.org/lifecycle/#experimental)

georef-graphql es un proyecto que implementa una API GraphQL de los datos importados de la API REST de [georef-ar](https://datosgobar.github.io/georef-ar-api/).

**georef-ar**: API del Servicio de Normalización de Datos Geográficos, permite normalizar y codificar los nombres de unidades territoriales de la Argentina (provincias, departamentos, municipios y localidades) y de sus calles, así como ubicar coordenadas dentro de ellas.

### Tools
- [NodeJS](https://nodejs.org/)
- [GraphQL](https://graphql.org/)
- [Prisma](https://www.prisma.io/)
- [Docker](https://www.docker.com/)
- [MySQL](https://www.mysql.com/) 

### Setup
```sh
  $ npm install -g prisma  
```
```sh
  $ npm install   
```
```sh
  # Environment: Copy .dist and edit .env
  $ cp .env.dist .env  
```
```sh
  # Docker
  $ docker-compose -f prisma/docker-compose.yml up -d  
```
```sh
  # Edit datamodel.graphql and run Prisma
  $ prisma deploy  
```

### Seed Países y Provincias
```sh
  $ npm run seed  
```

### Import Georef AR
```sh
  $ npm run import  
```

### Server App
```sh
  $ npm run start  
```

### Playground App & Prisma Admin
```sh
  # Edit .graphqlconfig.yml and run
  $ graphql playground  
```

### Token GraphQL Prisma Admin
```sh
  # Generate JWT
  $ prisma token    
```

```  
  {
    "Authorization":"Bearer eyJhbG...7Qk8"
  }    
```