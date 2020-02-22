const restful = require('node-restful')
const mongoose = restful.mongoose


const horasTrabalhadasSchema = new mongoose.Schema({
    date: {type: Date},
    pontos: {type: Array}
})

const colaboradorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    pis: { type: String, required: false },
    matricula: { type: String, required: false },
    admissao: { type: String, required: true },
    setor: { type: String, required: false },
    email: { type: String, required: true },
    telefone: { type: String, required: false },
    celular: { type: String, required: false },
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmpresaSchema',
        required: true
    }, 
    pin: { type: String },
    horas_trabalhadas: {
      type: [horasTrabalhadasSchema],
      required: false,
      select: false,
      default: []
    }
})

colaboradorSchema.statics.findByEmpresa = function (empresa, projection) {
  
  return this.find({ empresa }, projection)
}


// Create a sequence
function sequenceGenerator(name){
    var SequenceSchema, Sequence;
  
    SequenceSchema = new mongoose.Schema({
      nextSeqNumber: { type: Number, default: 1 }
    });
  
    Sequence = mongoose.model(name + 'Seq', SequenceSchema);
  
    return {
      next: function(callback){
        Sequence.find(function(err, data){
          if(err){ throw(err); }
  
          if(data.length < 1){
            // create if doesn't exist create and return first
            Sequence.create({}, function(err, seq){
              if(err) { throw(err); }
              callback(seq.nextSeqNumber);
            });
          } else {
            // update sequence and return next
            Sequence.findByIdAndUpdate(data[0]._id, { $inc: { nextSeqNumber: 1 } }, function(err, seq){
              if(err) { throw(err); }
              callback(seq.nextSeqNumber);
            });
          }
        });
      }
    };
  }
  var sequence = sequenceGenerator('colaboradorSchema');

  colaboradorSchema.pre('save', function(next){
    var doc = this;
    // get the next sequence
    sequence.next(function(nextSeq){
      doc.pin = nextSeq + `${Math.floor(Math.random() * 256)}`;
      next();
    });
  });


module.exports = restful.model('ColaboradorSchema', colaboradorSchema)