// Modules
const express = require("express") // Nosso framework
const mongoose = require("mongoose") // Mongoose para orm
const bodyParser = require("body-parser") // Para entender o que vem do body
const cors = require("cors") // Para requisições do mesmo domínio

// Routes
const authRouter = require("./routes/authRoutes.js")
const userRouter = require("./routes/userRoutes.js")
const partyRouter = require("./routes/partyRoutes.js")

// Middlewares

// Config
const dbName = "partytimeb"
const port = 8003

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public")) // Pasta responsável pelos arquivos estáticos

// Conexão MongoDb
mongoose.connect(
  `mongodb://localhost/${dbName}`, {
    useNewUrlParser: true,
    // useFindAndModify false,
    useUnifiedTopology: true
  }
)

// Atrelar as rotas no express
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/party", partyRouter)

app.get("/", (req, resp) => {
  resp.json({ message: "Rota Teste!" })
})

app.listen(port, () => {
  console.log(`O backend está rodando na porta: ${port}`)
})