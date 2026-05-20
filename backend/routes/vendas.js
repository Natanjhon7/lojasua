const express = require('express');
const router = express.Router();
const Venda = require('../models/Venda');
const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');
const Usuario = require('../models/Usuario');
const { estaLogado } = require('../middleware/auth');

// POST - Finalizar compra
router.post('/finalizar', estaLogado, async (req, res) => {
    try {
        const carrinho = await Carrinho.findOne({ usuarioId: req.session.userId });
        
        if (!carrinho || carrinho.itens.length === 0) {
            return res.status(400).json({ success: false, message: 'Carrinho vazio!' });
        }
        
        const usuario = await Usuario.findById(req.session.userId);
        
        let total = 0;
        const itensVenda = [];
        
        for (const item of carrinho.itens) {
            const produto = await Produto.findById(item.produtoId);
            if (produto) {
                const subtotal = produto.preco * item.quantidade;
                total += subtotal;
                itensVenda.push({
                    produtoId: produto._id,
                    nome: produto.nome,
                    quantidade: item.quantidade,
                    precoUnitario: produto.preco
                });
            }
        }
        
        const novaVenda = new Venda({
            usuarioId: req.session.userId,
            usuarioNome: usuario.nome,
            usuarioEmail: usuario.email,
            itens: itensVenda,
            total: total
        });
        
        await novaVenda.save();
        await Carrinho.findOneAndDelete({ usuarioId: req.session.userId });
        
        res.json({ success: true, message: 'Compra finalizada!', venda: novaVenda });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Histórico do usuário
router.get('/historico', estaLogado, async (req, res) => {
    try {
        const vendas = await Venda.find({ usuarioId: req.session.userId }).sort({ dataVenda: -1 });
        res.json({ success: true, vendas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;