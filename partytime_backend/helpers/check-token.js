const jwt = require("jsonwebtoken") // Pegando a lib JWT (Para podermos realizar ações com o token)

// Middleware para validar o token
const checkToken = (req, res, next) => {

  // Pegando o token (vem do header da requisição)
  const token = req.header("auth-token")

  // Se o token não veio
  if (!token) return res.status(401).json({ error: "Acesso negado!" })

  
  try {
    const verified = jwt.verify(token, "nossosecret") // Esse método, verify do JWT, verifica se o token é válido
    req.user = verified // Passando o resultado dizendo que o usuário está autenticado
    next() // Continua (Quando usamos um middleware temos que usar o next() para dizer que passou)
  } catch (err) {
    res.status(400).json({ error: "O Token é inválido!" }) // Se der algo errado
  }

};

// Retornando a função
module.exports = checkToken;