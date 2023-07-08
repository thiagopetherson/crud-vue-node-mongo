const router = require("express").Router() // Importando o Router do Express
const bcrypt = require("bcrypt") // Importando o pacote de hash para senha
const jwt = require("jsonwebtoken")

// Models
const User = require("../models/user")

// Registro de usuários
router.post("/register", async (req, resp) => {

  // Dados vindos da requisição
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  // Checando por campos obrigatórios
  if (name == null || email == null || password == null || confirmPassword == null)
    return resp.status(400).json({ error: "Por favor, preencha todos os campos!" })

  // Checando se as senhas combinam
  if (password != confirmPassword)
    return resp.status(400).json({ error: "As senhas não são iguais!" })

  // Verificando se o email já existe no sistema
  const emailExists = await User.findOne({ email: email })
  if (emailExists) return resp.status(400).json({ error: "Esse email já está cadastrado!" })

  // Criando o password
  const salt = await bcrypt.genSalt(12) // String com 12 caracteres
  const passwordHash = await bcrypt.hash(password, salt)

  // Instanciando um Usuário do Model
  const user = new User({
    name: name,
    email: email,
    password: passwordHash
  })

  try {
    const newUser = await user.save()

    // Criando token
    const token = jwt.sign(
      // Payload
      {
        name: newUser.name,
        id: newUser._id
      },
      "nossosecret"
    )

    // Retornando token
    resp.json({ error: null, message: "Você realizou o cadastro com sucesso", token: token, userId: newUser._id })

  } catch (error) {
    resp.status(400).json({ error })
  }

})

// Login do Usuário
router.post("/login", async (req, res) => {

  // Dados vindos da requisição
  const email = req.body.email
  const password = req.body.password

  // Verificando se o usuário existe no banco de dados
  const user = await User.findOne({ email: email })
  if (!user) return res.status(400).json({ error: "Não há usuário cadastrado com este e-mail!" })
  

  // Verificando a senha
  const checkPassword = await bcrypt.compare(password, user.password)

  if(!checkPassword) return res.status(400).json({ error: "Senha inválida" })

  // Criando o token
  const token = jwt.sign(
      // Payload
      {
      name: user.name,
      id: user._id,
      },
      "nossosecret"
  );

  // Retornando o token
  res.json({ error: null, msg: "Você está autenticado!", token: token, userId: user._id });


})

module.exports = router