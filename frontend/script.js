// ==================== CONFIGURAÇÃO ====================
const API_URL = 'https://lojasua-api.onrender.com/api';

// ==================== FUNÇÕES DE SESSÃO ====================
async function fazerLogin(email, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salvar usuário na sessionStorage para acesso rápido
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = 'index.html';
            return true;
        } else {
            return { error: data.message };
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return { error: 'Erro de conexão com o servidor' };
    }
}

async function verificarSessao() {
    try {
        const response = await fetch(`${API_URL}/auth/sessao`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.usuario) {
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
            return data.usuario;
        } else {
            sessionStorage.removeItem('usuario');
            return null;
        }
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

function getUsuarioLogado() {
    const usuario = sessionStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

async function isAdmin() {
    const usuario = getUsuarioLogado();
    if (!usuario) return false;
    
    // Se já temos na sessionStorage, use
    if (usuario.isAdmin !== undefined) return usuario.isAdmin;
    
    // Senão, busca do servidor
    const user = await verificarSessao();
    return user ? user.isAdmin : false;
}

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Erro no logout:', error);
    }
    sessionStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

function atualizarInterfaceUsuario() {
    const usuario = getUsuarioLogado();
    const logado = !!usuario;
    const admin = usuario && usuario.isAdmin === true;
    
    const menuCadastro = document.getElementById('menu-cadastro');
    const menuPerfil = document.getElementById('menu-perfil');
    const menuAdmin = document.getElementById('menu-admin');
    const menuLogout = document.getElementById('menu-logout');
    
    if (logado) {
        if (menuCadastro) menuCadastro.style.display = 'none';
        if (menuPerfil) menuPerfil.style.display = 'block';
        if (menuLogout) menuLogout.style.display = 'block';
        if (menuAdmin) {
            menuAdmin.style.display = admin ? 'block' : 'none';
        }
    } else {
        if (menuCadastro) menuCadastro.style.display = 'block';
        if (menuPerfil) menuPerfil.style.display = 'none';
        if (menuLogout) menuLogout.style.display = 'none';
        if (menuAdmin) menuAdmin.style.display = 'none';
    }
}

async function carregarPerfil() {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    
    const container = document.getElementById('perfil-info');
    if (container) {
        // Se tiver dados completos, use; senão, busque do servidor
        if (usuario.cpf !== undefined) {
            container.innerHTML = `
                <div class="perfil-info-item">
                    <span class="perfil-info-label">Nome:</span>
                    <span class="perfil-info-value">${usuario.nome}</span>
                </div>
                <div class="perfil-info-item">
                    <span class="perfil-info-label">E-mail:</span>
                    <span class="perfil-info-value">${usuario.email}</span>
                </div>
                <div class="perfil-info-item">
                    <span class="perfil-info-label">CPF:</span>
                    <span class="perfil-info-value">${usuario.cpf || 'Não informado'}</span>
                </div>
                <div class="perfil-info-item">
                    <span class="perfil-info-label">Telefone:</span>
                    <span class="perfil-info-value">${usuario.telefone || 'Não informado'}</span>
                </div>
                <div class="perfil-info-item">
                    <span class="perfil-info-label">Endereço:</span>
                    <span class="perfil-info-value">${usuario.endereco || 'Não informado'}</span>
                </div>
            `;
        } else {
            // Buscar dados completos do servidor
            try {
                const response = await fetch(`${API_URL}/auth/perfil`, { credentials: 'include' });
                const data = await response.json();
                if (data.success) {
                    container.innerHTML = `
                        <div class="perfil-info-item">
                            <span class="perfil-info-label">Nome:</span>
                            <span class="perfil-info-value">${data.usuario.nome}</span>
                        </div>
                        <div class="perfil-info-item">
                            <span class="perfil-info-label">E-mail:</span>
                            <span class="perfil-info-value">${data.usuario.email}</span>
                        </div>
                        <div class="perfil-info-item">
                            <span class="perfil-info-label">CPF:</span>
                            <span class="perfil-info-value">${data.usuario.cpf || 'Não informado'}</span>
                        </div>
                        <div class="perfil-info-item">
                            <span class="perfil-info-label">Telefone:</span>
                            <span class="perfil-info-value">${data.usuario.telefone || 'Não informado'}</span>
                        </div>
                        <div class="perfil-info-item">
                            <span class="perfil-info-label">Endereço:</span>
                            <span class="perfil-info-value">${data.usuario.endereco || 'Não informado'}</span>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }
    }
}

// ==================== PRODUTOS ====================
async function carregarProdutos(categoria = 'todos') {
    const container = document.getElementById('lista-produtos');
    if (!container) return;
    
    try {
        const url = categoria === 'todos' ? `${API_URL}/produtos` : `${API_URL}/produtos?categoria=${categoria}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            container.innerHTML = data.produtos.map(produto => `
                <div class="produto-card">
                    <div class="produto-imagem">${produto.imagem}</div>
                    <h3>${produto.nome}</h3>
                    <p class="produto-categoria">${produto.categoria}</p>
                    <p class="produto-preco">R$ ${produto.preco.toFixed(2)}</p>
                    <button onclick="adicionarAoCarrinho('${produto._id}')" class="btn btn-primary">Adicionar ao Carrinho</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p>Erro ao carregar produtos. Tente novamente.</p>';
    }
}

async function carregarProdutosDestaque() {
    const container = document.getElementById('produtos-destaque');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        
        if (data.success) {
            const destaques = data.produtos.slice(0, 4);
            container.innerHTML = destaques.map(produto => `
                <div class="produto-card">
                    <div class="produto-imagem">${produto.imagem}</div>
                    <h3>${produto.nome}</h3>
                    <p class="produto-preco">R$ ${produto.preco.toFixed(2)}</p>
                    <button onclick="adicionarAoCarrinho('${produto._id}')" class="btn btn-primary">Comprar</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

function filtrarProdutos(categoria) {
    carregarProdutos(categoria);
    // Atualizar botão ativo
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase().includes(categoria) || (categoria === 'todos' && btn.innerText === 'Todos')) {
            btn.classList.add('active');
        }
    });
}

// ==================== CARRINHO ====================
async function adicionarAoCarrinho(produtoId) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        if (confirm('Faça login para adicionar ao carrinho. Ir para o login?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrinho/adicionar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ produtoId, quantidade: 1 })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Produto adicionado ao carrinho!');
            atualizarContadorCarrinho();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar produto');
    }
}

async function carregarCarrinho() {
    const container = document.getElementById('carrinho-itens');
    const totalSpan = document.getElementById('total-carrinho');
    const subtotalSpan = document.getElementById('subtotal');
    
    if (!container) return;
    
    const usuario = getUsuarioLogado();
    if (!usuario) {
        container.innerHTML = '<div class="carrinho-vazio"><p>Faça login para ver seu carrinho.</p><a href="login.html" class="btn btn-primary">Fazer Login</a></div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrinho`, { credentials: 'include' });
        
        if (response.status === 401) {
            container.innerHTML = '<div class="carrinho-vazio"><p>Sessão expirada. Faça login novamente.</p><a href="login.html" class="btn btn-primary">Fazer Login</a></div>';
            return;
        }
        
        const data = await response.json();
        
        if (data.success && data.carrinho.length > 0) {
            let total = 0;
            container.innerHTML = data.carrinho.map(item => {
                const subtotal = item.preco * item.quantidade;
                total += subtotal;
                return `
                    <div class="carrinho-item">
                        <div><span style="font-size:2rem;">${item.imagem}</span> ${item.nome}</div>
                        <div>
                            <button onclick="alterarQuantidade('${item.id}', ${item.quantidade - 1})" class="btn-qtd">-</button>
                            <span class="qtd">${item.quantidade}</span>
                            <button onclick="alterarQuantidade('${item.id}', ${item.quantidade + 1})" class="btn-qtd">+</button>
                        </div>
                        <div>R$ ${item.preco.toFixed(2)}</div>
                        <div>Subtotal: R$ ${subtotal.toFixed(2)}</div>
                        <button onclick="removerDoCarrinho('${item.id}')" class="btn-remover">🗑️</button>
                    </div>
                `;
            }).join('');
            
            if (totalSpan) totalSpan.innerText = `R$ ${total.toFixed(2)}`;
            if (subtotalSpan) subtotalSpan.innerText = `R$ ${total.toFixed(2)}`;
        } else {
            container.innerHTML = '<div class="carrinho-vazio"><p>Seu carrinho está vazio.</p><a href="produtos.html" class="btn btn-primary">Continuar Comprando</a></div>';
            if (totalSpan) totalSpan.innerText = 'R$ 0,00';
        }
        atualizarContadorCarrinho();
    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = '<p>Erro ao carregar carrinho. Tente novamente.</p>';
    }
}

async function alterarQuantidade(produtoId, novaQuantidade) {
    if (novaQuantidade <= 0) {
        await removerDoCarrinho(produtoId);
        return;
    }
    
    try {
        await fetch(`${API_URL}/carrinho/atualizar/${produtoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantidade: novaQuantidade })
        });
        carregarCarrinho();
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function removerDoCarrinho(produtoId) {
    try {
        await fetch(`${API_URL}/carrinho/remover/${produtoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        carregarCarrinho();
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function limparCarrinho() {
    try {
        await fetch(`${API_URL}/carrinho/limpar`, {
            method: 'DELETE',
            credentials: 'include'
        });
        carregarCarrinho();
        alert('Carrinho limpo!');
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function finalizarCompra() {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        if (confirm('Faça login para finalizar a compra. Ir para o login?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vendas/finalizar`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ Compra finalizada! Total: R$ ${data.venda.total.toFixed(2)}`);
            carregarCarrinho();
            atualizarContadorCarrinho();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao finalizar compra');
    }
}

async function atualizarContadorCarrinho() {
    const usuario = getUsuarioLogado();
    if (!usuario) return;
    
    try {
        const response = await fetch(`${API_URL}/carrinho`, { credentials: 'include' });
        if (response.status === 401) return;
        
        const data = await response.json();
        if (data.success) {
            const total = data.carrinho.reduce((s, i) => s + i.quantidade, 0);
            const contadores = document.querySelectorAll('#contador-carrinho');
            contadores.forEach(c => { if (c) c.innerText = total; });
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// ==================== ADMIN ====================
async function carregarUsuariosAdmin() {
    const container = document.getElementById('admin-usuarios');
    if (!container) return;
    
    const usuario = getUsuarioLogado();
    if (!usuario || !usuario.isAdmin) {
        container.innerHTML = '<p>Acesso negado. Apenas administradores.</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios`, { credentials: 'include' });
        
        if (response.status === 403) {
            container.innerHTML = '<p>Acesso negado. Apenas administradores.</p>';
            return;
        }
        
        const data = await response.json();
        if (data.success && data.usuarios.length > 0) {
            container.innerHTML = data.usuarios.map(u => `
                <div class="usuario-item">
                    <strong>${u.nome}</strong><br>
                    <small>${u.email}</small><br>
                    <small>${u.isAdmin ? '👑 Admin' : '👤 Cliente'}</small>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Nenhum usuário cadastrado.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function carregarProdutosAdmin() {
    const container = document.getElementById('admin-produtos');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/produtos`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.success) {
            container.innerHTML = data.produtos.map(p => `
                <div class="produto-item">
                    ${p.imagem} ${p.nome} - R$ ${p.preco.toFixed(2)} (${p.categoria})
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function adicionarProdutoExemplo() {
    const novoProduto = {
        nome: "Produto Novo Exemplo",
        preco: 99.99,
        categoria: "eletronicos",
        imagem: "🆕",
        descricao: "Produto adicionado pelo admin"
    };
    
    try {
        const response = await fetch(`${API_URL}/admin/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(novoProduto)
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Produto adicionado!');
            carregarProdutosAdmin();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function gerarRelatorio() {
    const container = document.getElementById('relatorio-vendas');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/relatorio-vendas`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.success && data.vendas.length > 0) {
            let html = '<table class="relatorio-tabela">';
            html += '<thead><tr><th>Data</th><th>Cliente</th><th>Itens</th><th>Total</th></tr></thead><tbody>';
            data.vendas.forEach(venda => {
                const itensTexto = venda.itens.map(i => `${i.nome} (${i.quantidade}x)`).join(', ');
                html += `<tr>
                    <td>${new Date(venda.dataVenda).toLocaleString()}</td>
                    <td>${venda.usuarioNome}</td>
                    <td>${itensTexto}</td>
                    <td>R$ ${venda.total.toFixed(2)}</td>
                </tr>`;
            });
            html += `<tr class="total-row"><td colspan="3"><strong>TOTAL GERAL</strong></td><td><strong>R$ ${data.totalGeral.toFixed(2)}</strong></td></tr>`;
            html += '</tbody></table>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p>Nenhuma venda realizada.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sessão e atualizar interface
    await verificarSessao();
    atualizarInterfaceUsuario();
    atualizarContadorCarrinho();
    
    // Produtos destaque na home
    if (document.getElementById('produtos-destaque')) {
        carregarProdutosDestaque();
    }
    
    // Lista de produtos
    if (document.getElementById('lista-produtos')) {
        carregarProdutos();
    }
    
    // Carrinho
    if (document.getElementById('carrinho-itens')) {
        carregarCarrinho();
    }
    
    // Perfil
    if (document.getElementById('perfil-info')) {
        carregarPerfil();
    }
    
    // Admin
    if (document.getElementById('admin-usuarios')) {
        // Verificar se é admin antes de carregar
        const usuario = getUsuarioLogado();
        if (usuario && usuario.isAdmin) {
            carregarUsuariosAdmin();
            carregarProdutosAdmin();
        } else {
            document.getElementById('admin-usuarios').innerHTML = '<p>Acesso negado. Apenas administradores.</p>';
            document.getElementById('admin-produtos').innerHTML = '<p>Acesso negado.</p>';
        }
    }
});