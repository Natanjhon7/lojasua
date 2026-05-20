const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// Admin fixo - verificar e criar se não existir
async function garantirAdminFixo() {
    try {
        const admin = await Usuario.findOne({ email: 'admin@lojasua.com' });
        if (!admin) {
            const senhaHash = await bcrypt.hash('admin123', 10);
            const adminFixo = new Usuario({
                nome: 'Administrador',
                email: 'admin@lojasua.com',
                cpf: '000.000.000-00',
                senha: senhaHash,
                isAdmin: true
            });
            await adminFixo.save();
            console.log('✅ Admin fixo criado!');
        }
    } catch (error) {
        console.log('Erro ao criar admin:', error.message);
    }
}

// POST - Cadastro de usuário
router.post('/cadastrar', async (req, res) => {
    try {
        const { nome, cpf, email, telefone, endereco, senha } = req.body;
        
        // Verificar se email já existe
        const emailExiste = await Usuario.findOne({ email });
        if (emailExiste) {
            return res.status(400).json({ success: false, message: 'E-mail já cadastrado!' });
        }
        
        // Verificar se CPF já existe
        if (cpf) {
            const cpfExiste = await Usuario.findOne({ cpf });
            if (cpfExiste) {
                return res.status(400).json({ success: false, message: 'CPF já cadastrado!' });
            }
        }
        
        // Criptografar senha
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
        
        // Fazer login automático
        req.session.userId = novoUsuario._id;
        req.session.save((err) => {
            if (err) console.error('Erro ao salvar sessão:', err);
        });
        
        res.json({ 
            success: true, 
            message: 'Cadastro realizado com sucesso!',
            usuario: { id: novoUsuario._id, nome: novoUsuario.nome, email: novoUsuario.email, isAdmin: false }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        // Garantir que admin existe
        await garantirAdminFixo();
        
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
        }
        
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
        }
        
        req.session.userId = usuario._id;
        req.session.save((err) => {
            if (err) console.error('Erro ao salvar sessão:', err);
        });
        
        res.json({ 
            success: true, 
            message: 'Login realizado com sucesso!',
            usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email, isAdmin: usuario.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Verificar sessão atual
router.get('/sessao', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.json({ success: false, usuario: null });
        }
        
        const usuario = await Usuario.findById(req.session.userId).select('-senha');
        if (!usuario) {
            req.session.destroy();
            return res.json({ success: false, usuario: null });
        }
        
        res.json({ success: true, usuario });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Erro ao destruir sessão:', err);
        res.json({ success: true, message: 'Logout realizado!' });
    });
});

// GET - Dados do perfil
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