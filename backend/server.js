const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Configuração de CORS - IMPORTANTE PARA DEPLOY
const allowedOrigins = [
    'http://localhost:3000',
    'https://lojasua.vercel.app',
    'https://lojasua.onrender.com'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS não permitido'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.static('../frontend'));

// Configuração de sessões - USAR no ambiente de produção
app.use(session({
    secret: process.env.SESSION_SECRET || 'lojasua_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    }
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
                { nome: "Smartphone Galaxy S23", preco: 2999.99, categoria: "eletronicos", imagem: "📱" },
                { nome: "Notebook Dell Inspiron", preco: 4599.99, categoria: "eletronicos", imagem: "💻" },
                { nome: "Camiseta Polo", preco: 79.90, categoria: "roupas", imagem: "👕" },
                { nome: "Calça Jeans", preco: 149.90, categoria: "roupas", imagem: "👖" },
                { nome: "Livro Clean Code", preco: 89.90, categoria: "livros", imagem: "📚" },
                { nome: "Fone Bluetooth", preco: 199.90, categoria: "eletronicos", imagem: "🎧" },
                { nome: "Tênis Esportivo", preco: 299.90, categoria: "roupas", imagem: "👟" },
                { nome: "Livro Design Patterns", preco: 120.00, categoria: "livros", imagem: "📖" }
            ];
            await Produto.insertMany(produtosPadrao);
            console.log('✅ Produtos padrão inseridos!');
        }
        
        console.log('🚀 Servidor pronto!');
    })
    .catch(err => console.error('❌ Erro no MongoDB:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});