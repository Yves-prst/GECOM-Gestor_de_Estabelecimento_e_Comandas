let editingCategoryId = null

function openCategoryModal() {
  document.getElementById("categoryModal").classList.add("active")
  document.getElementById("categoryModal").style.display = "flex"
  document.getElementById("modalTitle").textContent = "Adicionar Categoria"
  editingCategoryId = null
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.remove("active")
  document.getElementById("categoryModal").style.display = "none"
  document.getElementById("categoryForm").reset()
  document.getElementById("categoryId").value = ""
  editingCategoryId = null
}

function editCategory(category) {
  document.getElementById("categoryModal").classList.add("active")
  document.getElementById("categoryModal").style.display = "flex"
  document.getElementById("modalTitle").textContent = "Editar Categoria"

  document.getElementById("categoryId").value = category.id
  document.getElementById("categoryName").value = category.name
  document.getElementById("categoryDescription").value = category.description || ""

  editingCategoryId = category.id
}

async function deleteCategory(id) {
  if (
    !confirm("Tem certeza que deseja excluir esta categoria? Todos os produtos desta categoria ficarão sem categoria.")
  ) {
    return
  }

  try {
    const response = await fetch("api/categories.php", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    })

    const result = await response.json()

    if (result.success) {
      showNotification("Categoria excluída com sucesso!", "success")
      setTimeout(() => location.reload(), 1000)
    } else {
      showNotification("Erro ao excluir categoria", "error")
    }
  } catch (error) {
    showNotification("Erro de conexão", "error")
  }
}

document.getElementById("categoryForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = {
    name: document.getElementById("categoryName").value,
    description: document.getElementById("categoryDescription").value,
  }

  if (editingCategoryId) {
    formData.id = editingCategoryId
  }

  try {
    const response = await fetch("api/categories.php", {
      method: editingCategoryId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()

    if (result.success) {
      showNotification(
        editingCategoryId ? "Categoria atualizada com sucesso!" : "Categoria adicionada com sucesso!",
        "success",
      )
      closeCategoryModal()
      setTimeout(() => location.reload(), 1000)
    } else {
      showNotification("Erro ao salvar categoria", "error")
    }
  } catch (error) {
    showNotification("Erro de conexão", "error")
  }
})

window.addEventListener("click", (e) => {
  const categoryModal = document.getElementById("categoryModal")
  if (e.target === categoryModal) {
    closeCategoryModal()
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

