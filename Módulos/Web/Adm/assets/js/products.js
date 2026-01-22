let editingProductId = null

function openProductModal() {
  document.getElementById("productModal").classList.add("active")
  document.getElementById("productModal").style.display = "flex"
  document.getElementById("modalTitle").textContent = "Adicionar Produto"
  editingProductId = null
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("active")
  document.getElementById("productModal").style.display = "none"
  document.getElementById("productForm").reset()
  document.getElementById("productId").value = ""
  editingProductId = null
}

function editProduct(product) {
  document.getElementById("productModal").classList.add("active")
  document.getElementById("productModal").style.display = "flex"
  document.getElementById("modalTitle").textContent = "Editar Produto"

  document.getElementById("productId").value = product.id
  document.getElementById("productName").value = product.name
  document.getElementById("productPrice").value = product.price
  document.getElementById("productStatus").value = product.status
  document.getElementById("productCategory").value = product.category_id || ""

  editingProductId = product.id
}

async function deleteProduct(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) {
    return
  }

  try {
    const response = await fetch("api/products.php", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    })

    const result = await response.json()

    if (result.success) {
      showNotification("Produto excluído com sucesso!", "success")
      setTimeout(() => location.reload(), 1000)
    } else {
      showNotification("Erro ao excluir produto", "error")
    }
  } catch (error) {
    showNotification("Erro de conexão", "error")
  }
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = {
    name: document.getElementById("productName").value,
    price: Number.parseFloat(document.getElementById("productPrice").value),
    status: document.getElementById("productStatus").value,
    category_id: document.getElementById("productCategory").value || null,
  }

  if (editingProductId) {
    formData.id = editingProductId
  }

  try {
    const response = await fetch("api/products.php", {
      method: editingProductId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()

    if (result.success) {
      showNotification(
        editingProductId ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!",
        "success",
      )
      closeProductModal()
      setTimeout(() => location.reload(), 1000)
    } else {
      showNotification("Erro ao salvar produto", "error")
    }
  } catch (error) {
    showNotification("Erro de conexão", "error")
  }
})

window.addEventListener("click", (e) => {
  const productModal = document.getElementById("productModal")
  if (e.target === productModal) {
    closeProductModal()
  }
})

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        ${message}
    `

  if (!document.querySelector(".notification-styles")) {
    const style = document.createElement("style")
    style.className = "notification-styles"
    style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 300px;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-success {
                border-left: 4px solid #28a745;
                color: #155724;
            }
            .notification-error {
                border-left: 4px solid #dc3545;
                color: #721c24;
            }
            .notification i {
                font-size: 18px;
            }
        `
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.classList.add("show")
  }, 100)

  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}
