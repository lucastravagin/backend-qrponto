const restful = require('node-restful')
const mongoose = restful.mongoose

const atackSchema = new mongoose.Schema({
    nameAtack: { type: String, required: true },
    spAtack: { type: Number, min: 0, required: [true, 'Informe o SP do ataque!'] }
})

const defSchema = new mongoose.Schema({
    nameDef: { type: String, required: true },
    spDef: { type: Number, min: 0, required: [true, 'Informe o SP da defesa!'] }
})

const pokemonSchema = new mongoose.Schema({
    urlImage: { type: String, required: false },
    name: { type: String, required: true },
    element: { type: String, required: true },
    speed: { type: Number, min: 0, max: 100, required: true },
    atacks: [atackSchema],
    defense: [defSchema]
})

module.exports = restful.model('PokemonSchema', pokemonSchema)