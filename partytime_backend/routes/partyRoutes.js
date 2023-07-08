const router = require("express").Router(); // Importando o router
const jwt = require("jsonwebtoken"); // Importando o JWT lib
const multer = require("multer"); // Importando o multer para upload de imagens

// Importando Models
const Party = require("../models/party")
const User = require("../models/user");

// Definindo onde salvaremos os arquivos das imagens
const diskStorage = require('../helpers/file-storage')
const upload = multer({ storage: diskStorage }) // Passando o multer

// Middlewares
const verifyToken = require("../helpers/check-token");

// Helpers
const getUserByToken = require("../helpers/get-user-by-token");

// Criando uma nova party (repare que colocamos dois middlewares ali [verifyToken e upload])
router.post("/", verifyToken, upload.fields([{name: "photos"}]), async (req, res) => {

  // Pegando os dados da requisição
  const title = req.body.title
  const description = req.body.description
  const partyDate = req.body.party_date

  // Variável para os arquivos
  let files = []

  // Pegando os arquivos da requisição
  if(req.files) {
    files = req.files.photos
  }

  // Validando os dados vindos da requisição
  if(title == "null" || description == "null" || partyDate == "null")
    return res.status(400).json({ error: "Preencha pelo menos nome, descrição e data." })

  const token = req.header("auth-token") // Pegando o token do usuário
  
  const userByToken = await getUserByToken(token) // Pegando o usuário pelo token
  
  const userId = userByToken._id.toString() // Pegando o ID do usuário

  const user = await User.findOne({ _id: userId }) // Pegando o usuário pelo seu id

  // Verificando se o usuário existe
  if (!user)
    return res.status(400).json({ error: "O usuário não existe!" })  

  // Criando um array de fotos com o path
  let photos = []

  // Verificando se vieram arquivos (se sim, pegaremos o caminho das fotos e armazenando no array)
  if(files && files.length > 0) {
    files.forEach((photo, i) => {
      photos[i] = photo.path
    })
  } 
  /* 
  else {
    photos = null
  } 
  */

  // Criando um objeto de festa com os dados da requisição
  const party = new Party({
    title: title,
    description: description,
    partyDate: partyDate,
    photos: photos,
    privacy: req.body.privacy,
    userId: userId
  });

  try {
    // Salvando a festa e retornando a mensagem de sucesso
      const newParty = await party.save();
      res.json({ error: null, msg: "Evento criado com sucesso!", data: newParty })
  } catch (error) {
      res.status(400).json({ error })      
  }
})

// Pegar todas as rotas que estiverem com status de privacidade como false
router.get("/all", async (req, res) => {

  try {     
    const parties = await Party.find({ privacy: false }).sort([['_id', -1]]);
    res.json({ error: null, parties: parties });

  } catch (error) {

    res.status(400).json({ error })
      
  }
})

// Todas as Festas do Usuário Logado
router.get("/userparties", verifyToken, async function (req, res) {

  try {      

    const token = req.header("auth-token") // Pegando o token do usuário

    const user = await getUserByToken(token) // Pegando o usuário logado pelo token
    
    const userId = user._id.toString() // Pegando o ID do usuário

    const parties = await Party.find({ userId: userId }) // Pegando as festas do usuário logado
    res.json({ error: null, parties: parties })

  } catch (error) {
    res.status(400).json({ error })      
  }
})

// Pegando uma festa específica do usuário logado
router.get("/userparty/:id", verifyToken, async function (req, res) {

  try {      

    const token = req.header("auth-token") // Pegando o token do usuário

    const user = await getUserByToken(token) // Pegando o usuário logado pelo token
    
    const userId = user._id.toString() // Pegando o ID do usuário
    const partyId = req.params.id // Pegando o ID da festa que veio por parâmetro na rota

    const party = await Party.findOne({ _id: partyId, userId: userId }) // Pegando a festa com base no ID do usuário e da festa

    res.json({ error: null, party: party })

  } catch (error) {

    res.status(400).json({ error })
      
  }

})

// Pegar uma festa específica (sendo pública ou privada)
router.get("/:id", async (req, res) => {

  // Pegando o parâmetro da rota
  const id = req.params.id

  const party = await Party.findOne({ _id: id }) // Pegando uma rota específica

  if(party === null) 
    res.json({ error: null, msg: "Este evento não existe!" })  

  // Festa pública
  if(party.privacy === false) {
    res.json({ error: null, party: party })
  
  } else { // Festa Privada

    const token = req.header("auth-token") // Pegando o token do usuário

    const user = await getUserByToken(token) // Pegando o usuário logado pelo token
    
    const userId = user._id.toString() // Pegando o ID do usuário
    const partyUserId = party.userId.toString()

    // Verificando se o id do usuário logado é o mesmo do id do usuário da festa
    if(userId == partyUserId) {
      res.json({ error: null, party: party })
    } else {
      res.status(401).json({ error: "Acesso negado!" })
    }

  }  

})

// Deletando uma Festa
router.delete("/", verifyToken, async (req, res) => {

  const token = req.header("auth-token") // Pegando o token do usuário
  const user = await getUserByToken(token) // Pegando o usuário logado pelo token
  const partyId = req.body.id // Pegando o id da festa que veio na requisição
  const userId = user._id.toString() // Pegando o ID do usuário

  try {      
    await Party.deleteOne({ _id: partyId, userId: userId }) // Deletando a Festa com base no id da festa que veio na requisição
    res.json({ error: null, msg: "Evento removido com sucesso!" })

  } catch (error) {
    res.status(400).json({ error })      
  }
})

// Atualizando uma festa (o update.fields é para verificar se veio imagem na requisição)
router.put("/", verifyToken, upload.fields([{name: "photos"}]), async (req, res) => {

  // Pegando os dados vindos da requisição
  const title = req.body.title
  const description = req.body.description
  const partyDate = req.body.partyDate
  const partyId = req.body.id
  const partyUserId = req.body.user_id

  let files = [] // Veriável que armazenará as imagens

  // Pegando os arquivos da requisição
  if(req.files)
    files = req.files.photos  

  // Validando os dados vindos da requisição
  if(title == "null" || description == "null" || partyDate == "null")
    return res.status(400).json({ error: "Preencha pelo menos nome, descrição e data." })

  const token = req.header("auth-token") // Pegando o token do usuário
  
  const userByToken = await getUserByToken(token) // Pegando o usuário pelo token
  
  const userId = userByToken._id.toString() // Pegando o ID do usuário

  const user = await User.findOne({ _id: userId }) // Pegando o usuário pelo seu id

  // Verificando se o usuário existe
  if (!user)
    return res.status(400).json({ error: "O usuário não existe!" })  

  // Criando um objeto de festa
  const party = {
    id: partyId,
    title: title,
    description: description,
    partyDate: partyDate,
    privacy: req.body.privacy,
    userId: partyUserId
  }; 

  // Criando um array de fotos com o path
  let photos = []

  // Verificando se vieram arquivos (se sim, pegaremos o caminho das fotos e armazenando no array)
  if(files && files.length > 0) {
    files.forEach((photo, i) => {
      photos[i] = photo.path
    })
    party.photos = photos
  }
  
  try {      
    // Retornando os dados atualizados
    const updatedParty = await Party.findOneAndUpdate({ _id: partyId, userId: partyUserId }, { $set: party }, {new: true});
    res.json({ error: null, msg: "Evento atualizado com sucesso!", data: updatedParty });

  } catch (error) {
    res.status(400).json({ error })      
  }
})


module.exports = router