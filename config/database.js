const mongoose = require('mongoose')

mongoose.Promise = global.Promise;
module.exports = mongoose.connect('mongodb://qrponto:ZByiUcSGr1alEm2m@cluster0-shard-00-00-dyqdr.mongodb.net:27017,cluster0-shard-00-01-dyqdr.mongodb.net:27017,cluster0-shard-00-02-dyqdr.mongodb.net:27017/qrponto?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true, keepAlive: true, reconnectTries: Number.MAX_VALUE, useMongoClient: true })

mongoose.Error.messages.general.required = "O atributo '{PATH}' é obrigatório."
mongoose.Error.messages.Number.min = "O '{VALUE}' informado é menor que o limite mínimo de '{MIN}'."
mongoose.Error.messages.Number.max = "O '{VALUE}' informado é maior que o limite máximo de '{MAX}'."
mongoose.Error.messages.String.enum = "'{VALUE}' não é válido para o atributo '{PATH}'."