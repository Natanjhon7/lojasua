const express = require('express');
const router = express.Router();
const Venda = require('../models/Venda');
const Usuario = require('../models/Usuario');
const Produto = require('../models/Produto');

async function isAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }
    
    const usuario = await Usuario.findById(req.session.userId);
    if (!usuario || !usuario.isAdmin) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    next();
}

router.get('/relatorio-vendas', isAdmin, async (req, res) => {
    try {
        const vendas = await Venda.find().sort({ dataVenda: -1 });
        const totalGeral = vendas.reduce((sum, v) => sum + v.total, 0);
        res.json({ success: true, vendas, totalGeral });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/usuarios', isAdmin, async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha');
        res.json({ success: true, usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/produtos', isAdmin, async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json({ success: true, produtos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/produtos', isAdmin, async (req, res) => {
    try {
        const { nome, preco, categoria, imagem } = req.body;
        const novoProduto = new Produto({ nome, preco, categoria, imagem: imagem || '📦' });
        await novoProduto.save();
        res.json({ success: true, message: 'Produto adicionado!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;