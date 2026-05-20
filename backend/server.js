const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static('../frontend'));

// Sessões
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 dia
}));

// Importar rotas
const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');
const vendasRoutes = require('./routes/vendas');
const adminRoutes = require('./routes/admin');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/admin', adminRoutes);

// Rota de teste
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', session: req.session.userId || 'nenhum' });
});

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Conectado ao MongoDB Atlas!');
        
        // Inserir produtos padrão se não existirem
        const Produto = require('./models/Produto');
        const count = await Produto.countDocuments();
        
        if (count === 0) {
            const produtosPadrao = [
                { nome: "Smartphone Galaxy S23", preco: 2999.99, categoria: "eletronicos", imagem: "📱", descricao: "O mais novo smartphone da linha Galaxy" },
                { nome: "Notebook Dell Inspiron", preco: 4599.99, categoria: "eletronicos", imagem: "💻", descricao: "Notebook potente para trabalho" },
                { nome: "Camiseta Polo", preco: 79.90, categoria: "roupas", imagem: "👕", descricao: "Camiseta de algodão premium" },
                { nome: "Calça Jeans", preco: 149.90, categoria: "roupas", imagem: "👖", descricao: "Jeans confortável e moderno" },
                { nome: "Livro Clean Code", preco: 89.90, categoria: "livros", imagem: "📚", descricao: "Guia para código limpo" },
                { nome: "Fone Bluetooth", preco: 199.90, categoria: "eletronicos", imagem: "🎧", descricao: "Fone sem fio alta qualidade" },
                { nome: "Tênis Esportivo", preco: 299.90, categoria: "roupas", imagem: "👟", descricao: "Tênis leve e confortável" },
                { nome: "Livro Design Patterns", preco: 120.00, categoria: "livros", imagem: "📖", descricao: "Padrões de projeto" }
            ];
            await Produto.insertMany(produtosPadrao);
            console.log('✅ Produtos padrão inseridos!');
        }
        
        console.log('🚀 Servidor pronto!');
    })
    .catch(err => console.error('❌ Erro no MongoDB:', err.message));

app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${process.env.PORT || 3000}`);
});