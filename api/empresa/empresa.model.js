const restful = require('node-restful')
const mongoose = restful.mongoose


const empresaSchema = new mongoose.Schema({

    razao_social: { type: String, required: true },
    nome_fantasia: { type: String, required: true },
    cnpj: { type: String, required: true }, 
    email: {type: String, required: true},
    password: {type: String, min: 6, max:12, required: true }
    

})

module.exports = restful.model('EmpresaSchema', empresaSchema)