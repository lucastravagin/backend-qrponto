const restful = require('node-restful')
const mongoose = restful.mongoose


const contadorSchema = new mongoose.Schema({

    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    celular: { type: String, required: true },
    empresa: { type: String, required: true }


})

module.exports = restful.model('ContadorSchema', contadorSchema)