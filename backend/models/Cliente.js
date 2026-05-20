const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório']
    },
    cpf: {
        type: String,
        required: [true, 'CPF é obrigatório'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'E-mail é obrigatório'],
        lowercase: true
    },
    telefone: {
        type: String,
        default: ''
    },
    endereco: {
        type: String,
        default: ''
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória']
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cliente', ClienteSchema);