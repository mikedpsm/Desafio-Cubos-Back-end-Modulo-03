const express = require("express");
const usuarios = require("./controladores/usuarios");
const produtos = require("./controladores/produtos");
const verificaLogin = require("./filtros/verificaLogin");

const rotas = express();

rotas.post("/usuario", usuarios.cadastrarUsuario);

rotas.post("/login", usuarios.login);

rotas.use(verificaLogin);

rotas.put("/usuario", usuarios.editarUsuario);

rotas.get("/usuario", usuarios.detalharUsuario);

rotas.post("/produtos", produtos.cadastrarProdutos);

rotas.get("/produtos", produtos.listarProdutos);

rotas.get("/produtos/:id", produtos.detalharProdutos);

rotas.put("/produtos/:id", produtos.editarProdutos);

rotas.delete("/produtos/:id", produtos.removerProdutos);

module.exports = rotas;
