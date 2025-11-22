function openMesaModal() {
    document.getElementById('mesaModal').classList.add('active');
    document.getElementById('mesaId').value = '';
    document.getElementById('mesaCapacidade').value = '';
    document.getElementById('mesaStatus').value = 'disponivel';
    document.getElementById('modalMesaTitle').textContent = 'Adicionar Mesa';
}

function closeMesaModal() {
    document.getElementById('mesaModal').classList.remove('active');
}

function editMesa(id) {
    fetch(`mesas.php?action=get&id=${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            document.getElementById('mesaId').value = data.id;
            document.getElementById('mesaCapacidade').value = data.capacidade;
            document.getElementById('mesaStatus').value = data.status;
            document.getElementById('modalMesaTitle').textContent = 'Editar Mesa ' + data.numero;
            document.getElementById('mesaModal').classList.add('active');
        }).catch(() => alert('Erro ao carregar mesa.'));
}

document.getElementById('mesaForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('mesaId').value;
    const capacidade = document.getElementById('mesaCapacidade').value;
    const status = document.getElementById('mesaStatus').value;
    const action = id ? 'edit' : 'create';

    let body = `capacidade=${encodeURIComponent(capacidade)}&status=${encodeURIComponent(status)}`;
    if (id) {
        body += `&id=${encodeURIComponent(id)}`;
    }

    fetch(`mesas.php?action=${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            closeMesaModal();
            location.reload();
        })
        .catch(() => alert('Erro ao salvar mesa.'));
});

function deleteMesa(id) {
    if (!confirm('Deseja realmente excluir esta mesa?')) return;

    fetch(`mesas.php?action=delete&id=${id}`)
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            location.reload();
        })
        .catch(() => alert('Erro ao excluir mesa.'));
}

window.onclick = function (event) {
    const modal = document.getElementById('mesaModal');
    if (event.target === modal) {
        closeMesaModal();
    }
};
