const mongoose = require('mongoose');

const CarrinhoItemSchema = new mongoose.Schema({
    produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
    quantidade: { type: Number, required: true, min: 1 }
});

const CarrinhoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    itens: [CarrinhoItemSchema],
    atualizadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Carrinho', CarrinhoSchema);