const _ = require('lodash')
const Colaborador = require('./colaborador.model')

Colaborador.methods(['get', 'post', 'put', 'delete'])
Colaborador.updateOptions({ new: true, runValidators: true })

Colaborador.after('post', sendErrorsOrNext).after('put', sendErrorsOrNext)

function sendErrorsOrNext(req, res, next) {
    const bundle = res.locals.bundle
    if (bundle.errors) {
        var errors = parseErrors(bundle.errors)
        res.status(500).json({ errors })
    } else {
        next()
    }
}

function parseErrors(nodeRestfulErrors) {
    const errors = []
    _.forIn(nodeRestfulErrors, error => errors.push(error.message))
    return errors
}

Colaborador.route('count', function(req, res, next) {
    Colaborador.count(function(error, value) {
        if (error) {
            res.status(500).json({ errors: [error] })
        } else {
            res.json({ value })
        }
    })
})






module.exports = Colaborador