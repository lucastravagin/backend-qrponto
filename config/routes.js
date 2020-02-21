const express = require('express')
const auth = require('../config/auth')

module.exports = function(server) {


        /*
     * Rotas abertas
     */
    const openApi = express.Router()
    server.use('/oapi', openApi)

    const AuthService = require('../api/user/auth.service')
    openApi.post('/login', AuthService.login)
    openApi.post('/signup', AuthService.signup)
    openApi.post('/validateToken', AuthService.validateToken)

       /*
     * Rotas protegidas por Token JWT
     */
    const protectedApi = express.Router()
    server.use('/', protectedApi)

	protectedApi.use(auth)



    const empresaService = require('../api/empresa/empresa.service')
    empresaService.register(protectedApi, '/empresas')

    const colaboradorService = require('../api/colaborador/colaborador.service')
    colaboradorService.register(protectedApi, '/colaboradores')
    protectedApi.get('/colaborador-empresa/:id', AuthService.getColaborarByEmpresa)

    const contadorService = require('../api/contador/contador.service')
    contadorService.register(protectedApi, '/contadores')
}