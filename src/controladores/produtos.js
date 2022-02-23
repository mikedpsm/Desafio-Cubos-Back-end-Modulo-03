const conexao = require("../conexao");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwt_secret");

const cadastrarProdutos = async (req, res) => {
  const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;
  const { usuario } = req;

  if (!nome || !quantidade || !preco || !descricao) {
    return res.status(401).json({
      mensagem:
        "Os campos nome, quantidade, preço e descrição são obrigatórios",
    });
  }

  try {
    const queryCadastro =
      "INSERT INTO produtos (usuario_id, nome, quantidade, categoria, preco, descricao, imagem) VALUES ($1, $2, $3, $4, $5, $6, $7)";
    const cadastro = await conexao.query(queryCadastro, [
      usuario.id,
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
    ]);

    if (cadastro.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível cadastrar o produto." });
    }

    return res.status(201).json({ mensagem: "Produto cadastrado." });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const editarProdutos = async (req, res) => {
  const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;
  const { usuario } = req;
  const { id: idProduto } = req.params;

  if (!nome || !quantidade || !preco || !descricao) {
    return res.status(401).json({
      mensagem:
        "Os campos nome, quantidade, preço e descrição são obrigatórios",
    });
  }

  try {
    const queryCadastro =
      "SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2";
    const produto = await conexao.query(queryCadastro, [usuario.id, idProduto]);
    console.log(usuario.id);
    console.log(idProduto);

    if (produto.rowCount === 0) {
      return res.status(404).json({ mensagem: "Produto não encontrado" });
    }

    const queryCadastroExistente =
      "UPDATE produtos SET nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 WHERE (usuario_id = $7 AND id = $8)";
    const cadastro = await conexao.query(queryCadastroExistente, [
      nome,
      quantidade,
      categoria,
      preco,
      descricao,
      imagem,
      usuario.id,
      idProduto,
    ]);

    if (cadastro.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível atualizar o produto." });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const listarProdutos = async (req, res) => {
  const { usuario } = req;

  try {
    const { rows: produtos } = await conexao.query(
      "SELECT * FROM produtos WHERE usuario_id = $1",
      [usuario.id]
    );
    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const detalharProdutos = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;

  try {
    const { rows: produtos } = await conexao.query(
      "SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2",
      [id, usuario.id]
    );
    return res.status(200).json(produtos);
  } catch (error) {}
};

const removerProdutos = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;

  try {
    const queryProdutoExistente =
      "SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2";
    const produtoExistente = await conexao.query(queryProdutoExistente, [
      id,
      usuario.id,
    ]);

    if (produtoExistente.rowCount === 0) {
      return res
        .status(404)
        .json({ mensagem: "Não existe produto para o id mencionado" });
    }

    const { rowCount } = await conexao.query(
      "DELETE FROM produtos WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível excluir o produto" });
    }

    return res.status(200).json({ mensagem: "Produto excluído com sucesso" });
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  listarProdutos,
  detalharProdutos,
  cadastrarProdutos,
  editarProdutos,
  removerProdutos,
};
