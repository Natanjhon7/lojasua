// ==================== CONFIGURAÇÃO ====================
const API_URL = 'https://lojasua-api.onrender.com/api';

// ==================== FUNÇÕES DE LOGIN ====================
async function fazerLogin(email, senha) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = '/';
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, message: 'Erro de conexão com o servidor' };
    }
}

async function cadastrarUsuario(dados) {
    try {
        const response = await fetch(`${API_URL}/auth/cadastrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(dados)
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = '/';
            return { success: true };
        } else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        return { success: false, message: 'Erro de conexão com o servidor' };
    }
}

async function verificarSessao() {
    try {
        const response = await fetch(`${API_URL}/auth/sessao`, {
            credentials: 'include',
            mode: 'cors'
        });
        const data = await response.json();
        
        if (data.usuario) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            return data.usuario;
        } else {
            localStorage.removeItem('usuario');
            return null;
        }
    } catch (error) {
        console.error('Erro:', error);
        return null;
    }
}

function getUsuarioLogado() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

async function isAdmin() {
    const usuario = getUsuarioLogado();
    if (!usuario) return false;
    return usuario.isAdmin === true;
}

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors'
        });
    } catch (error) {
        console.error('Erro:', error);
    }
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

async function atualizarInterfaceUsuario() {
    await verificarSessao();
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
        try {
            const response = await fetch(`${API_URL}/auth/perfil`, { 
                credentials: 'include',
                mode: 'cors'
            });
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
        container.innerHTML = '<p>Erro ao carregar produtos.</p>';
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
}

// ==================== CARRINHO ====================
async function adicionarAoCarrinho(produtoId) {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        if (confirm('Faça login para adicionar ao carrinho.')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrinho/adicionar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({ produtoId, quantidade: 1 })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Produto adicionado ao carrinho!');
            atualizarContadorCarrinho();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function carregarCarrinho() {
    const container = document.getElementById('carrinho-itens');
    const totalSpan = document.getElementById('total-carrinho');
    
    if (!container) return;
    
    const usuario = getUsuarioLogado();
    if (!usuario) {
        container.innerHTML = '<div class="carrinho-vazio"><p>Faça login para ver seu carrinho.</p><a href="login.html" class="btn btn-primary">Fazer Login</a></div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/carrinho`, { 
            credentials: 'include',
            mode: 'cors'
        });
        
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
        } else {
            container.innerHTML = '<div class="carrinho-vazio"><p>Seu carrinho está vazio.</p><a href="produtos.html" class="btn btn-primary">Continuar Comprando</a></div>';
            if (totalSpan) totalSpan.innerText = 'R$ 0,00';
        }
        atualizarContadorCarrinho();
    } catch (error) {
        console.error('Erro:', error);
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
            mode: 'cors',
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
            credentials: 'include',
            mode: 'cors'
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
            credentials: 'include',
            mode: 'cors'
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
        if (confirm('Faça login para finalizar a compra.')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vendas/finalizar`, {
            method: 'POST',
            credentials: 'include',
            mode: 'cors'
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
    }
}

async function atualizarContadorCarrinho() {
    const usuario = getUsuarioLogado();
    if (!usuario) return;
    
    try {
        const response = await fetch(`${API_URL}/carrinho`, { 
            credentials: 'include',
            mode: 'cors'
        });
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
    
    try {
        const response = await fetch(`${API_URL}/admin/usuarios`, { 
            credentials: 'include',
            mode: 'cors'
        });
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
        const response = await fetch(`${API_URL}/admin/produtos`, { 
            credentials: 'include',
            mode: 'cors'
        });
        const data = await response.json();
        
        if (data.success) {
            container.innerHTML = data.produtos.map(p => `
                <div class="produto-item">${p.imagem} ${p.nome} - R$ ${p.preco.toFixed(2)} (${p.categoria})</div>
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
        imagem: "🆕"
    };
    
    try {
        const response = await fetch(`${API_URL}/admin/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify(novoProduto)
        });
        
        const data = await response.json();
        if (data.success) {
            alert('Produto adicionado!');
            carregarProdutosAdmin();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function gerarRelatorio() {
    const container = document.getElementById('relatorio-vendas');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/relatorio-vendas`, { 
            credentials: 'include',
            mode: 'cors'
        });
        const data = await response.json();
        
        if (data.success && data.vendas.length > 0) {
            let html = '<table class="relatorio-tabela"><thead><tr><th>Data</th><th>Cliente</th><th>Itens</th><th>Total</th></tr></thead><tbody>';
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
    await atualizarInterfaceUsuario();
    await atualizarContadorCarrinho();
    
    if (document.getElementById('produtos-destaque')) carregarProdutosDestaque();
    if (document.getElementById('lista-produtos')) carregarProdutos();
    if (document.getElementById('carrinho-itens')) carregarCarrinho();
    if (document.getElementById('perfil-info')) carregarPerfil();
    if (document.getElementById('admin-usuarios')) {
        carregarUsuariosAdmin();
        carregarProdutosAdmin();
    }
});