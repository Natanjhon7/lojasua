const express = require('express');
const router = express.Router();
const Produto = require('../models/Produto');

// GET - Listar produtos
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

module.exports = router;