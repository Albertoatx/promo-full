var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

// Create the Schema.
var ObraSchema = new mongoose.Schema({
  //FALTA el CODIGO PROMOTOR al que esta asociado.
  codigoob: {type: String, required: true},
  //codigoob: {type: ObjectId, required: true},
  nombreob: {type: String, required: true},
  descriob: String,
/*  tipob: String,
  estadob: String,
  durac: String,
  presupuesto: Number,
  superficie: Number,
  materiales: String,
  fechaprom: Date,
  terminacion: Date,
  viviendas: Number,
  direcob: {
    calleob : String,
    pueblob  : String,
    provinciob: String,
    codpostalob: String,
  }, */
  creado: {type: Date, default: Date.now}
});

// Export the model.
module.exports = mongoose.model('Obra', ObraSchema);