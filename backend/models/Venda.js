const mongoose = require('mongoose');

const VendaItemSchema = new mongoose.Schema({
    produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    nome: String,
    quantidade: Number,
    precoUnitario: Number
});

const VendaSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    usuarioNome: String,
    usuarioEmail: String,
    itens: [VendaItemSchema],
    total: { type: Number, required: true },
    dataVenda: { type: Date, default: Date.now },
    status: { type: String, default: 'concluida' }
});

module.exports = mongoose.model('Venda', VendaSchema);