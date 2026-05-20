const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
    try {
        const clientes = await Cliente.find().select('-senha');
        res.json({ success: true, clientes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, cpf, email, telefone, endereco, senha } = req.body;
    
        const clienteExistente = await Cliente.findOne({ cpf });
        if (clienteExistente) {
            return res.status(400).json({ success: false, message: 'CPF já cadastrado' });
        }
    
        const senhaHash = await bcrypt.hash(senha, 10);
        
        const novoCliente = new Cliente({
            nome,
            cpf,
            email,
            telefone,
            endereco,
            senha: senhaHash
        });
        
        await novoCliente.save();
        
        res.json({ success: true, message: 'Cadastro realizado com sucesso!', id: novoCliente._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;