const jwt = require("jsonwebtoken") // Lib do JWT

// Importando a model User
const User = require("../models/user")

// Pegando um usuário pelo seu token
const getUserByToken = async (token) => {

  // Se o token estiver inválido, vamos retornar uma mensagem
  if (!token) return res.status(401).json({ error: "Acesso negado!" })
    
  // Decodificando o token
  const decoded = jwt.verify(token, 'nossosecret')

  // Pegando o id do usuário logado
  const userId = decoded.id;

  // Pegando o usuário
  const user = await User.findOne({ _id: userId })

  // Retornando o usuário
  return user
}

module.exports = getUserByToken