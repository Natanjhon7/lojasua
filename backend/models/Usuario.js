const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    telefone: { type: String, default: '' },
    endereco: { type: String, default: '' },
    senha: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    dataCadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);