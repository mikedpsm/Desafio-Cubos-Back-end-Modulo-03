const conexao = require("../conexao");
const securePassword = require("secure-password");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwt_secret");

const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {
  const { nome, nomeLoja, email, senha } = req.body;

  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório." });
  }

  if (!nomeLoja) {
    return res
      .status(400)
      .json({ mensagem: "O campo nome da loja é obrigatório." });
  }

  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório." });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório." });
  }

  //Criar usuário no banco de dados
  try {
    const queryUser = "SELECT * FROM usuarios WHERE email = $1";
    const usuarioExiste = await conexao.query(queryUser, [email]);

    if (usuarioExiste.rowCount > 0) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }
  // Criar hash da senha
  try {
    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
    const query =
      "INSERT INTO usuarios (nome, nomeLoja, email, senha) VALUES ($1, $2, $3, $4)";
    const usuario = await conexao.query(query, [nome, nomeLoja, email, hash]);

    if (usuario.rowCount === 0) {
      return res
        .status(404)
        .json({ mensagem: "Não foi possível cadastrar o usuário." });
    }

    return res.status(201).json({});
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email) {
    return res.status(403).json({ mensagem: "O campo email é obrigatório." });
  }

  if (!senha) {
    return res.status(403).json({ mensagem: "O campo senha é obrigatório." });
  }

  // Logar usuário checando email e, depois, hash da senha, gerando um token
  try {
    const query = "SELECT * FROM usuarios WHERE email = $1";
    const usuarios = await conexao.query(query, [email]);

    if (usuarios.rowCount == 0) {
      return res
        .status(403)
        .json({ mensagem: "Usuário e/ou senha inválido(s)." });
    }

    const usuario = usuarios.rows[0];

    const result = await pwd.verify(
      Buffer.from(senha),
      Buffer.from(usuario.senha, "hex")
    );

    switch (result) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        return console.log("Email ou senha incorretos.");
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");
          const query = "UPDATE usuarios SET senha = $1 where email = $2";
          // eslint-disable-next-line no-unused-vars
          const usuario = await conexao.query(query, [hash, email]);
        // eslint-disable-next-line no-empty
        } catch {}
        break;
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        nomeLoja: usuario.nomeLoja,
        email: usuario.email,
      },
      jwtSecret
    );

    return res.send(token);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const detalharUsuario = async (req, res) => {
  const { usuario } = req;

  try {
    const query = "SELECT * FROM usuarios WHERE id = $1";
    const resposta = await conexao.query(query, [usuario.id]);
    const { rows } = resposta;

    // eslint-disable-next-line no-unused-vars
    const { senha, ...dadosUsuario } = rows[0];

    return res.status(200).json(dadosUsuario);
  } catch (error) {
    return res.status(401).json(error.message);
  }
};

const editarUsuario = async (req, res) => {
  const { nome, email, senha, nomeLoja } = req.body;
  const { usuario } = req;

  if (!nome) {
    return res.status(400).json({ mensagem: "O campo nome é obrigatório." });
  }

  if (!nomeLoja) {
    return res
      .status(400)
      .json({ mensagem: "O campo nome da loja é obrigatório." });
  }

  if (!email) {
    return res.status(400).json({ mensagem: "O campo email é obrigatório." });
  }

  if (!senha) {
    return res.status(400).json({ mensagem: "O campo senha é obrigatório." });
  }

  try {
    //Buscar usuário
    const query = "SELECT * FROM usuarios WHERE id = $1";
    const resposta = await conexao.query(query, [usuario.id]);
    if (resposta.rowCount === 0) {
      return res.stauts(404).json({ mensagem: "Usuário não encontrado" });
    }

    // Verificar se o novo email já está em uso no banco de dados
    const queryEmail = "SELECT * FROM usuarios WHERE email = $1";
    // eslint-disable-next-line no-unused-vars
    const respostaEmail = await conexao.query(queryEmail, [email]);

    if (usuario.rowCount > 0) {
      return res.status(400).json({
        mensagem: "Já existe usuário cadastrado com o e-mail informado.",
      });
    }

    //Transformar a nova senha em hash code e jogar os dados no banco de dados
    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

    const queryAtualizar =
      "UPDATE usuarios SET nome = $1, nomeLoja = $2, email = $3, senha = $4 WHERE id = $5";
    const usuarioPut = await conexao.query(queryAtualizar, [
      nome,
      nomeLoja,
      email,
      hash,
      usuario.id,
    ]);

    if (usuarioPut.rowCount === 0) {
      return res
        .status(400)
        .json({ mensagem: "Não foi possível cadastrar o usuário." });
    }

    return res.status(201).send();
  } catch (error) {
    return res.status(401).json(error.message);
  }
};

module.exports = {
  login,
  cadastrarUsuario,
  detalharUsuario,
  editarUsuario,
};
