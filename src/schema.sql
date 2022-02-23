CREATE DATABASE market_cubos;

CREATE TABLE IF NOT EXISTS usuarios (
  id serial PRIMARY KEY,
  nome varchar(60) NOT NULL,
  nome_loja varchar(60),
  email varchar(30) NOT NULL UNIQUE,
  senha text NOT NULL
  );

CREATE TABLE IF NOT EXISTS produtos (
  id serial PRIMARY KEY,
  usuario_id int,
  nome varchar(60) NOT NULL,
  quantidade int DEFAULT 0,
  categoria varchar(20) NOT NULL,
  preco int DEFAULT 0,
  descricao text,
  imagem text,
  FOREIGN KEY (usuario_id) references usuarios (id)
  );