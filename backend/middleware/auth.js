// Middleware para verificar se usuário está logado
function estaLogado(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Não autorizado. Faça login.' });
    }
    next();
}

// Middleware para verificar se é admin
async function isAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Não autorizado' });
    }
    
    const Usuario = require('../models/Usuario');
    const usuario = await Usuario.findById(req.session.userId);
    
    if (!usuario || !usuario.isAdmin) {
        return res.status(403).json({ success: false, message: 'Acesso negado. Apenas administradores.' });
    }
    
    next();
}

module.exports = { estaLogado, isAdmin };