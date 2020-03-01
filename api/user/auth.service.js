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
    return res.status(400).json({ errors })
}

const loginColaborador = (req, res, next) => {
    const email = req.body.email || ''
    const pin = req.body.pin || ''

    Colaborador.findOne({ email }, (err, colaborador) => {

        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (colaborador && (pin === colaborador.pin)) {
            const token = jwt.sign(colaborador.toJSON(), env.authSecret, {
                expiresIn: "1 day"
            })
            const { nome, email, _id } = colaborador
            res.json({ nome, email, _id, token })
        } else {
            return res.status(400).send({ errors: ['Usuário/Pin inválidos'] })
        }
    })
}

const login = (req, res, next) => {
    const email = req.body.email || ''
    const password = req.body.password || ''

    Empresa.findOne({ email }, (err, empresa) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (empresa && bcrypt.compareSync(password, empresa.password)) {
            const token = jwt.sign(empresa.toJSON(), env.authSecret, {
                expiresIn: "1 day"
            })
            const { nome_fantasia, email, _id } = empresa
            res.json({ nome_fantasia, email, _id, token })
        } else {
            return res.status(400).send({ errors: ['Usuário/Senha inválidos'] })
        }
    })
}

const validateToken = (req, res, next) => {
    const token = req.body.token || ''
    jwt.verify(token, env.authSecret, function (err, decoded) {
        return res.status(200).send({ valid: !err })
    })
}

const signup = (req, res, next) => {
    const razao_social = req.body.razao_social || ''
    const nome_fantasia = req.body.nome_fantasia || ''
    const cnpj = req.body.cnpj || ''
    const email = req.body.email || ''
    const password = req.body.password || ''
    const confirmPassword = req.body.confirm_password || ''

    if (!email.match(emailRegex)) {
        return res.status(400).send({ errors: ['O e-mail informado está inválido'] })
    }

    if (!password.match(passwordRegex)) {
        return res.status(400).send({
            errors: [
                "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$%) e tamanho entre 6-12."
            ]
        })
    }

    const salt = bcrypt.genSaltSync()
    const passwordHash = bcrypt.hashSync(password, salt)
    if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
        return res.status(400).send({ errors: ['Senhas não conferem.'] })
    }

    Empresa.findOne({ email }, (err, empresa) => {
        if (err) {
            return sendErrorsFromDB(res, err)
        } else if (empresa) {
            return res.status(400).send({ errors: ['Empresa já cadastrada.'] })
        } else {
            const newUser = new Empresa({ razao_social, nome_fantasia, cnpj, email, password: passwordHash })
            newUser.save(err => {
                if (err) {
                    return sendErrorsFromDB(res, err)
                } else {
                    login(req, res, next)
                }
            })
        }
    })
}

const getColaborarByEmpresa = (req, res, next) => {
    if (req.params.id) {
        Colaborador.findByEmpresa(req.params.id)
            .then(colaborador => colaborador ? colaborador : [])
            .then(document => {
                res.json(document)
            })
            .catch(next)
    }
}

function parse(horario) {
     
    if (typeof horario === "undefined") {
        console.log('entrou aqui')
        horario = '00:00'
    }
    let [hora, minuto] = horario.split(':').map(v => parseInt(v));
    if (!minuto) { // para o caso de não ter os minutos
        minuto = 0;
    }
    return minuto + (hora * 60);
}

function duracao(entrada1, saida1, entrada2, saida2) {
    return (parse(saida1) - parse(entrada1)) + (parse(saida2) - parse(entrada2));
}

let jornadaNormal = 478;
let diff = 0
let horas = 0
let minutos = 0
const getHorasTrabalhadas = (req, res, next) => {
    if (req.params.id) {
        Colaborador.findById(req.params.id, '+horas_trabalhadas')
            .then(colaborador => {
                if (!colaborador) {
                    return res.status(404).send({ errors: 'Colaborador não encontrado' })
                } else {
                    for(let i = 0; i < colaborador.horas_trabalhadas.length; i++) {
                        colaborador.horas_trabalhadas[i].duracao = 
                        duracao(
                            colaborador.horas_trabalhadas[i].pontos[0],
                            colaborador.horas_trabalhadas[i].pontos[1],
                            colaborador.horas_trabalhadas[i].pontos[2],
                            colaborador.horas_trabalhadas[i].pontos[3]
                        )
                        diff = Math.abs(colaborador.horas_trabalhadas[i].duracao - jornadaNormal)
                        if(diff != 0) {
                             horas = Math.floor(diff / 60);
                             minutos = diff - (horas * 60);
                             colaborador.horas_trabalhadas[i].hora_extra = 
                             `${horas} horas e ${minutos} minutos a ${colaborador.horas_trabalhadas[i].duracao > jornadaNormal ? 'mais' : 'menos'}`
                        }
                    }
                    res.json(colaborador.horas_trabalhadas)
                    return next()
                }
            }).catch(next)
    }
}

const putHorasTrabalhadas = (req, res, next) => {
    const options = { runValidators: true, new: true }
    Colaborador.findOneAndUpdate(
        { "_id": req.params.id, "horas_trabalhadas._id": req.body._id },
        {
            "$set": {
                "horas_trabalhadas.$": req.body
            }
        },
        options).then(colaborador => {
            if (!colaborador) {
                return res.status(404).send({ errors: ['Colaborador não encontrado'] })
            } else {
                res.json(colaborador.horas_trabalhadas)
                return next()
            }
        }).catch(next)
}

const postHorasTrabalhadas = (req, res, next) => {
    const options = { runValidators: true, new: true }
    Colaborador.findByIdAndUpdate(
          req.params.id,
        {
            "$push": {
                "horas_trabalhadas": req.body
            }
        },
        options).then(colaborador => {
            if (!colaborador) {
                return res.status(404).send({ errors: ['Colaborador não encontrado'] })
            } else {
                res.json(colaborador.horas_trabalhadas)
                return next()
            }
        }).catch(next)
}


module.exports = { login, signup, validateToken, getColaborarByEmpresa, loginColaborador, getHorasTrabalhadas, putHorasTrabalhadas, postHorasTrabalhadas }