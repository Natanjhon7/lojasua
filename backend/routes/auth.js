const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// POST - Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
        }
        
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
        }
        
        req.session.userId = usuario._id;
        
        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso!',
            usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email, isAdmin: usuario.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Cadastro
router.post('/cadastrar', async (req, res) => {
    try {
        const { nome, cpf, email, telefone, endereco, senha } = req.body;
        
        const emailExiste = await Usuario.findOne({ email });
        if (emailExiste) {
            return res.status(400).json({ success: false, message: 'E-mail já cadastrado!' });
        }
        
        const senhaHash = await bcrypt.hash(senha, 10);
        
        const novoUsuario = new Usuario({
            nome,
            cpf: cpf || '',
            email,
            telefone: telefone || '',
            endereco: endereco || '',
            senha: senhaHash,
            isAdmin: false
        });
        
        await novoUsuario.save();
        
        req.session.userId = novoUsuario._id;
        
        res.json({ 
            success: true, 
            message: 'Cadastro realizado com sucesso!',
            usuario: { id: novoUsuario._id, nome: novoUsuario.nome, email: novoUsuario.email, isAdmin: false }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Verificar sessão
router.get('/sessao', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.json({ success: false, usuario: null });
        }
        
        const usuario = await Usuario.findById(req.session.userId).select('-senha');
        res.json({ success: true, usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logout realizado!' });
});

// GET - Perfil
router.get('/perfil', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Não logado' });
        }
        
        const usuario = await Usuario.findById(req.session.userId).select('-senha');
        res.json({ success: true, usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;