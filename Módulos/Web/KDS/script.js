// script.js - KDS com Comunicação em Tempo Real
document.addEventListener('DOMContentLoaded', function() {
    const ordersContainer = document.getElementById('orders-container');
    const noOrdersMessage = document.getElementById('no-orders');
    const orderCountElement = document.getElementById('order-count');
    const currentTimeElement = document.getElementById('current-time');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let currentFilter = 'all';
    let orders = [];
    let refreshInterval;

    // Função para carregar pedidos
    async function loadOrders() {
        try {
            const response = await fetch('kitchen_dashboard.php');
            if (!response.ok) throw new Error(`Erro no servidor: ${response.statusText}`);
            orders = await response.json();
            renderOrders();
            updateOrderCount();
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            showError('Não foi possível carregar os pedidos.');
        }
    }
    
    function renderOrders() {
        const filteredOrders = filterOrders();
        
        if (filteredOrders.length === 0) {
            ordersContainer.style.display = 'none';
            noOrdersMessage.style.display = 'block';
        } else {
            ordersContainer.style.display = 'grid';
            noOrdersMessage.style.display = 'none';
            
            ordersContainer.innerHTML = '';
            
            filteredOrders.forEach(order => {
                const orderElement = createOrderElement(order);
                ordersContainer.appendChild(orderElement);
            });
        }
    }
    
    function filterOrders() {
        if (currentFilter === 'all') {
            return orders;
        }
        return orders.filter(order => order.status === currentFilter);
    }
    
    function updateOrderCount() {
        const filteredCount = filterOrders().length;
        const totalCount = orders.length;
        orderCountElement.textContent = `${filteredCount} de ${totalCount} pedidos`;
    }
    
    function createOrderElement(order) {
        const orderDiv = document.createElement('div');
        orderDiv.className = `order-card ${order.status}`;
        orderDiv.id = `order-${order.id}`;
        
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleString('pt-BR');
        
        const now = new Date();
        const elapsedMinutes = Math.floor((now - orderDate) / (1000 * 60));
        
        let elapsedText = elapsedMinutes < 1 ? 'Agora' : `${elapsedMinutes} min atrás`;
        
        const statusText = {
            'sent_to_kitchen': 'Novo Pedido',
            'preparing': 'Em Preparação',
            'ready': 'Pronto'
        }[order.status] || order.status;
        
        orderDiv.innerHTML = `
            <div class="order-header">
                <div class="order-id">Pedido #${order.id}</div>
                <div class="order-status status-${order.status}">${statusText}</div>
            </div>
            <div class="order-meta">
                <div class="order-time">🕒 ${formattedDate}</div>
                <div class="order-elapsed">${elapsedText}</div>
            </div>
            <div class="order-meta">
                <div class="order-mesa">🍽️ Mesa: ${order.mesas || 'N/A'}</div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <div class="item-header">
                            <span class="item-quantity">${item.quantity}x</span>
                            <span class="item-name">${item.product_name}</span>
                        </div>
                        ${item.addons ? `<div class="item-addons">➕ ${item.addons}</div>` : ''}
                        ${item.notes ? `<div class="item-notes">📝 ${item.notes}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            <div class="order-actions">
                ${order.status === 'sent_to_kitchen' ? 
                    `<button class="btn btn-primary" onclick="startPreparing(${order.id})">👨‍🍳 Iniciar Preparo</button>` : ''}
                ${order.status === 'preparing' ? 
                    `<button class="btn btn-success" onclick="markAsReady(${order.id})">✅ Marcar como Pronto</button>` : ''}
                ${order.status === 'ready' ? 
                    `<button class="btn btn-completed" disabled>🔄 Aguardando Entrega</button>` : ''}
            </div>
        `;
        
        return orderDiv;
    }
    
    function showError(message) {
        ordersContainer.innerHTML = `<div class="error-message"><p>${message}</p><button onclick="location.reload()">Tentar Novamente</button></div>`;
    }
    
    // Configurar auto-refresh a cada 10 segundos
    function startAutoRefresh() {
        refreshInterval = setInterval(loadOrders, 10000);
    }
    
    function stopAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    }

    // Event listeners para filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-status');
            renderOrders();
            updateOrderCount();
        });
    });

    function updateCurrentTime() {
        currentTimeElement.textContent = new Date().toLocaleTimeString('pt-BR');
    }
    
    // Inicialização
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    loadOrders();
    startAutoRefresh();
});

// Função para atualizar status do pedido
async function updateOrderStatus(orderId, action) {
    try {
        const formData = new FormData();
        formData.append('order_id', orderId);
        formData.append('action', action);

        const response = await fetch('process_order.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Recarregar a lista de pedidos após 1 segundo
            setTimeout(() => {
                location.reload(); // Recarregar a página para garantir atualização
            }, 1000);
        } else {
            throw new Error(data.message || 'Falha ao atualizar status');
        }
    } catch (error) {
        console.error(`Erro ao atualizar pedido ${orderId}:`, error);
        alert('Erro ao comunicar com o servidor: ' + error.message);
    }
}

// Funções globais para os botões
window.startPreparing = function(orderId) {
    if (confirm(`Iniciar preparo do pedido #${orderId}?`)) {
        updateOrderStatus(orderId, 'start_preparing');
    }
}

window.markAsReady = function(orderId) {
    if (confirm(`Confirmar que o pedido #${orderId} está PRONTO para entrega?`)) {
        updateOrderStatus(orderId, 'mark_ready');
    }
}