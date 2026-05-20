const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

// GET - Listar produtos (com filtro)
router.get('/', async (req, res) => {
    try {
        const { categoria } = req.query;
        
        let filtro = {};
        if (categoria && categoria !== 'todos') {
            filtro.categoria = categoria;
        }
        
        const produtos = await Produto.find(filtro);
        res.json({ success: true, produtos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Produto por ID
router.get('/:id', async (req, res) => {
    try {
        const produto = await Produto.findById(req.params.id);
        if (!produto) {
            return res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }
        res.json({ success: true, produto });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;