const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();

// ==================== CONFIGURAÇÃO CORS CORRIGIDA ====================
app.use(cors({
    origin: ['https://lojasua.vercel.app', 'http://localhost:3000', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== CONFIGURAÇÃO DE SESSÃO CORRIGIDA ====================
app.use(session({
    secret: process.env.SESSION_SECRET || 'lojasua_secret_key_2025',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60,
        touchAfter: 3600
    }),
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    },
    name: 'lojasua_session'
}));

// ==================== ROTAS ====================
const authRoutes = require('./routes/auth');
const produtosRoutes = require('./routes/produtos');
const carrinhoRoutes = require('./routes/carrinho');
const vendasRoutes = require('./routes/vendas');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/admin', adminRoutes);

// ==================== ROTA DE TESTE ====================
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        session: req.session.userId ? 'logado' : 'deslogado',
        sessionId: req.sessionID
    });
});

// ==================== CONEXÃO MONGODB ====================
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Conectado ao MongoDB Atlas!');
        
        const Produto = require('./models/Produto');
        const Usuario = require('./models/Usuario');
        const bcrypt = require('bcryptjs');
        
        // Inserir produtos padrão
        const countProdutos = await Produto.countDocuments();
        if (countProdutos === 0) {
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
        
        // Criar admin se não existir
        const admin = await Usuario.findOne({ email: 'admin@lojasua.com' });
        if (!admin) {
            const senhaHash = await bcrypt.hash('admin123', 10);
            await Usuario.create({
                nome: 'Administrador',
                email: 'admin@lojasua.com',
                cpf: '000.000.000-00',
                senha: senhaHash,
                isAdmin: true
            });
            console.log('✅ Admin criado!');
        }
        
        console.log('🚀 Servidor pronto!');
    })
    .catch(err => console.error('❌ Erro no MongoDB:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});