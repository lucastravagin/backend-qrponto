const _ = require('lodash')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Empresa = require('../empresa/empresa.model')
const Colaborador = require('../colaborador/colaborador.model')
const env = require('../../.env')

const emailRegex = /\S+@\S+\.\S+/
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,12})/

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = []
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({errors})
}

const login = (req, res, next) => {
    const email = req.body.email || ''
    const password = req.body.password || ''

    Empresa.findOne({email}, (err, empresa) => {
        if(err) {
            return sendErrorsFromDB(res, err)
        } else if (empresa && bcrypt.compareSync(password, empresa.password)) {
            const token = jwt.sign(empresa.toJSON(), env.authSecret, {
                expiresIn: "1 day"
            })
            const { nome_fantasia, email, _id } = empresa
            res.json({ nome_fantasia, email, _id, token })
        } else {
            return res.status(400).send({errors: ['Usuário/Senha inválidos']})
        }
    })
}

const validateToken = (req, res, next) => {
    const token = req.body.token || ''
    jwt.verify(token, env.authSecret, function(err, decoded) {
        return res.status(200).send({valid: !err})
    })
}

const signup = (req, res, next) => {
    const razao_social = req.body.razao_social || ''
    const nome_fantasia = req.body.nome_fantasia || ''
    const cnpj = req.body.cnpj || ''
    const email = req.body.email || ''
    const password = req.body.password || ''
    const confirmPassword = req.body.confirm_password || ''

    if(!email.match(emailRegex)) {
        return res.status(400).send({errors: ['O e-mail informado está inválido']})
    }

    if(!password.match(passwordRegex)) {
        return res.status(400).send({errors: [
            "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%) e tamanho entre 6-12."
        ]})
    }

    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(password, salt)
    if(!bcrypt.compareSync(confirmPassword, passwordHash)) {
        return res.status(400).send({errors: ['Senhas não conferem.']})
    }

    Empresa.findOne({email}, (err, empresa) => {
        if(err) {
            return sendErrorsFromDB(res, err)
        } else if (empresa) {
            return res.status(400).send({errors: ['Empresa já cadastrada.']})
        } else {
            const newUser = new Empresa({razao_social,nome_fantasia, cnpj, email, password: passwordHash })
            newUser.save(err => {
                if(err) {
                    return sendErrorsFromDB(res, err)
                } else {
                    login(req, res, next)
                }
            })
        }        
    })
}

const getColaborarByEmpresa = (req, res, next) => {
    if(req.params.id) {
        Colaborador.findByEmpresa(req.params.id)
            .then(colaborador => colaborador ? colaborador : [])
            .then(document => {
                res.json(document)
            })
            .catch(next)
    }
}

module.exports = { login, signup, validateToken, getColaborarByEmpresa }