const jwt = require("jsonwebtoken");
const jwtSecret = require("../jwt_secret");
const conexao = require("../conexao");

const verificaLogin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(404).json({ mensagem: "Token não informado" });
  }

  try {
    const token = authorization.replace("Bearer", "").trim();

    const { id } = jwt.verify(token, jwtSecret);

    const query = "SELECT * FROM usuarios where id = $1";
    const { rows, rowsCount } = await conexao.query(query, [id]);

    if (rowsCount === 0) {
      return res.status(404).json({ mensagem: "O usuário não foi encontrado" });
    }
    const { senha, ...usuario } = rows[0];

    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(404).json(error.message);
  }
};

module.exports = verificaLogin;

// bearer do rafa
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZSI6IlJhZmEiLCJub21lX2xvamEiOiJIeXBlclgiLCJlbWFpbCI6InJhZmFAaHlwZXJ4LmNvbSIsImlhdCI6MTYzOTE3MzAyMH0.ObyG59WxME8R4t9uUIkMiuv4fFpzEDkb3e-Hwys4Q-s
