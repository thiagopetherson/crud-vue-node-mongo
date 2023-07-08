const router = require("express").Router() // Importando o Router do Express
const bcrypt = require("bcrypt") // Importando o pacote de hash para senha

// Models
const User = require("../models/user")

// Middlewares
const verifyToken = require("../helpers/check-token")

// Helpers
const getUserByToken = require("../helpers/get-user-by-token")

// Pegar um usuário
router.get("/:id", verifyToken, async (req, resp) => {
  const id = req.params.id

  // Verificar se usuário existe e pegar os dados dele (excluindo a senha)
  try {
    const user = await User.findOne({ _id: id }, { password: 0 })
    resp.json({ error: null, user })
  } catch (error) {
    return resp.status(400).json({ error: "O usuário não existe!" })
  }    
})

// Atualizando um usuário (O usuário logado só pode atualizar os dados dele mesmo)
router.patch("/", verifyToken, async (req, res) => {

    // Resgatando o Token
    const token = req.header("auth-token") // Pegando o token do usuário logado
    const user = await getUserByToken(token); // Resgatando um usuário pelo seu token
    const userReqId = req.body.id; // O id do usuário que veio no body da requisição
    const password = req.body.password; // A senha do usuário que veio no body da requisição
    const confirmPassword = req.body.confirmpassword; // A confirmação de senha do usuário que veio no body da requisição
  
    const userId = user._id.toString() // Passando o id (que vem como ObjectID) para String
  
    // Verificando se o id que veio na requisição é igual o id do token
    if(userId != userReqId)
      res.status(401).json({ error: "Acesso negado!" })  

    // Criando um Objeto de Usuário
    const updateData = {
      name: req.body.name,
      email: req.body.email
    };

    // Checando se as senhas batem e o password não está vazio (Se baterem e não estiver vazio, então faremos a atualização da senha)
    if(password != confirmPassword) {
      res.status(401).json({ error: "As senhas não conferem." })
    } else if(password == confirmPassword && password != null) {

      // Criando o Password
      const salt = await bcrypt.genSalt(12);
      const reqPassword = req.body.password;
      const passwordHash = await bcrypt.hash(reqPassword, salt);

      req.body.password = passwordHash // Não sei pq o professor fez isso aqui. Porém estava no código a aula e eu deixei

      // Adicionando o password no Objeto do usuário
      updateData.password = passwordHash;
    }
  
    try {     
  
      // Retornando os dados do usuário atualizado
      const updatedUser = await User.findOneAndUpdate({ _id: userId }, { $set:  updateData}, {new: true})
      res.json({ error: null, msg: "Usuário atualizado com sucesso!", data: updatedUser })  
    } catch (error) {  
      res.status(400).json({ error })        
    }  
  });


module.exports = router;