const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    categoria: { type: String, enum: ['eletronicos', 'roupas', 'livros'], required: true },
    imagem: { type: String, default: '📦' },
    descricao: { type: String, default: '' },
    estoque: { type: Number, default: 10 }
});

module.exports = mongoose.model('Produto', ProdutoSchema);