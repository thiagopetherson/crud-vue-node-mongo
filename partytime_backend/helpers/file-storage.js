const multer = require("multer") // Importando a lib multer
const path = require("path") // Importando o Path (isso é do próprio node. É um módulo para trabalhar com diretórios)

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/') // Destino do arquivo
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)) // Nomeando o arquivo
    }
});

module.exports = diskStorage