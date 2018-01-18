var mongoose = require('mongoose');

//var ObjectId = mongoose.Schema.Types.ObjectId;


var Promociones = new mongoose.Schema({
  //FALTA el CODIGO PROMOTOR al que esta asociado.
  codigoobra: {type: String, required: true},
  //codigoob: {type: ObjectId, required: true},
  nombreobra: {type: String, required: true},
  creada_por: {type: String},
  creada: {type: Date, default: Date.now}
//});
},{ _id : false });



// Create the Schema.
var PromotorSchema = new mongoose.Schema({
 // codigop: {type: ObjectId, required: true},
  codigop: {type: String, required: true, unique: true},
  nombrep: {type: String, required: true},
  creado_por: {type: String},
  actualizado_por: {type: String},
  cifp: String,
  telefp: String,
  emailp: String,
  direcp: {
    callep : String,
    pueblo  : String,
    provincia: String,
    codpostal: String
  },
  promociones: [Promociones],
  creado_el: {type: Date, default: Date.now},
  actualizado_el: {type: Date, default: Date.now}
});

// Export the model.
module.exports = mongoose.model('Promotor', PromotorSchema);