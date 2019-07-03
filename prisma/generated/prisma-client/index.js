"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Pais",
    embedded: false
  },
  {
    name: "Provincia",
    embedded: false
  },
  {
    name: "Localidad",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://localhost:${process.env["PRISMA_PORT"]}`,
  secret: `${process.env["secret"]}`
});
exports.prisma = new exports.Prisma();
