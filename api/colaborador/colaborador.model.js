const restful = require('node-restful')
const mongoose = restful.mongoose


const colaboradorSchema = new mongoose.Schema({


    nome: { type: String },
    cpf: { type: String },
    pis: { type: String },
    matricula: { type: String },
    admissao: { type: String },
    horario: { type: String },
    setor: { type: String },
    endereco: { type: String },
    bairro: { type: String },
    cep: { type: String },
    cidade: { type: String },
    estado: { type: String },
    email: { type: String },
    telefone: { type: String },
    celular: { type: String }





})

module.exports = restful.model('ColaboradorSchema', colaboradorSchema)