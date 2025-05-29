
let mostrando = true
let valorReal = "1234,56"

function Esconder() {
  const valor = document.getElementById("p-valor")
  const icone = document.getElementById("icone")

  if (mostrando) {
    valor.textContent = "••••••••••"
    icone.classList.remove("fa-eye")
    icone.classList.add("fa-eye-slash")
  } else {
    valor.textContent = valorReal
    icone.classList.remove("fa-eye-slash")
    icone.classList.add("fa-eye")
  }

  mostrando = !mostrando
}

function toggleMenu() {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('active');

  // Fecha o menu ao clicar fora
  document.addEventListener('click', function handleClickOutside(e) {
    if (!menu.contains(e.target) && !e.target.closest('.menu-toggle')) {
      menu.classList.remove('active');
      document.removeEventListener('click', handleClickOutside);
    }
  });
}
