const express = require('express');
const router = express.Router();
const Venda = require('../models/Venda');
const Usuario = require('../models/Usuario');
const Produto = require('../models/Produto');
const { isAdmin } = require('../middleware/auth');

// Todos os endpoints admin exigem isAdmin
router.use(isAdmin);

// GET - Relatório de vendas
router.get('/relatorio-vendas', async (req, res) => {
    try {
        const vendas = await Venda.find().sort({ dataVenda: -1 });
        const totalGeral = vendas.reduce((sum, v) => sum + v.total, 0);
        
        res.json({ success: true, vendas, totalGeral });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Listar usuários
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-senha');
        res.json({ success: true, usuarios });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Listar produtos
router.get('/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json({ success: true, produtos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Adicionar produto
router.post('/produtos', async (req, res) => {
    try {
        const { nome, preco, categoria, imagem, descricao } = req.body;
        
        const novoProduto = new Produto({
            nome,
            preco,
            categoria,
            imagem: imagem || '📦',
            descricao: descricao || ''
        });
        
        await novoProduto.save();
        res.json({ success: true, message: 'Produto adicionado!', produto: novoProduto });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Remover produto
router.delete('/produtos/:id', async (req, res) => {
    try {
        await Produto.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Produto removido!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;