# API GraphQL de Localidades Modernización:

- NodeJS
- GraphQL
- Prisma
- Docker
- MySQL 

### Setup
```sh
  $ npm install -g prisma  
```
```sh
  $ npm install   
```
```sh
  # Environment
  $ cp .env.dist .env  
```
```sh
  # Docker
  $ docker-compose -f prisma/docker-compose.yml up -d  
```
```sh
  # Edit datamodel.graphql and run
  $ prisma deploy  
```

### Seed Países y Provincias
```sh
  $ npm run seed  
```

### Import Localidades
```sh
  $ npm run import  
```

### Server
```sh
  $ npm run start  
```

### Playground
```sh
  # Edit .graphqlconfig.yml and run
  $ graphql playground  
```
