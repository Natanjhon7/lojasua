const express = require('express');
const router = express.Router();
const Carrinho = require('../models/Carrinho');
const Produto = require('../models/Produto');
const { estaLogado } = require('../middleware/auth');

// Obter carrinho do usuário
async function getCarrinho(usuarioId) {
    let carrinho = await Carrinho.findOne({ usuarioId });
    if (!carrinho) {
        carrinho = new Carrinho({ usuarioId, itens: [] });
        await carrinho.save();
    }
    return carrinho;
}

// GET - Obter carrinho
router.get('/', estaLogado, async (req, res) => {
    try {
        const carrinho = await getCarrinho(req.session.userId);
        
        // Popular com dados dos produtos
        const itensCompletos = [];
        for (const item of carrinho.itens) {
            const produto = await Produto.findById(item.produtoId);
            if (produto) {
                itensCompletos.push({
                    id: produto._id,
                    nome: produto.nome,
                    preco: produto.preco,
                    quantidade: item.quantidade,
                    imagem: produto.imagem
                });
            }
        }
        
        res.json({ success: true, carrinho: itensCompletos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Adicionar item
router.post('/adicionar', estaLogado, async (req, res) => {
    try {
        const { produtoId, quantidade } = req.body;
        const carrinho = await getCarrinho(req.session.userId);
        
        const itemExistente = carrinho.itens.find(
            item => item.produtoId.toString() === produtoId
        );
        
        if (itemExistente) {
            itemExistente.quantidade += quantidade || 1;
        } else {
            carrinho.itens.push({ produtoId, quantidade: quantidade || 1 });
        }
        
        carrinho.atualizadoEm = Date.now();
        await carrinho.save();
        
        res.json({ success: true, message: 'Produto adicionado ao carrinho!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Atualizar quantidade
router.put('/atualizar/:produtoId', estaLogado, async (req, res) => {
    try {
        const { produtoId } = req.params;
        const { quantidade } = req.body;
        
        const carrinho = await getCarrinho(req.session.userId);
        const item = carrinho.itens.find(i => i.produtoId.toString() === produtoId);
        
        if (item) {
            if (quantidade <= 0) {
                carrinho.itens = carrinho.itens.filter(i => i.produtoId.toString() !== produtoId);
            } else {
                item.quantidade = quantidade;
            }
            await carrinho.save();
        }
        
        res.json({ success: true, message: 'Carrinho atualizado!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Remover item
router.delete('/remover/:produtoId', estaLogado, async (req, res) => {
    try {
        const { produtoId } = req.params;
        const carrinho = await getCarrinho(req.session.userId);
        
        carrinho.itens = carrinho.itens.filter(i => i.produtoId.toString() !== produtoId);
        await carrinho.save();
        
        res.json({ success: true, message: 'Item removido!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Limpar carrinho
router.delete('/limpar', estaLogado, async (req, res) => {
    try {
        await Carrinho.findOneAndDelete({ usuarioId: req.session.userId });
        res.json({ success: true, message: 'Carrinho limpo!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;