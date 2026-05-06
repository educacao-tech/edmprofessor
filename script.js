// script.js

// Seleciona o formulário e a tabela
const form = document.querySelector("form");
const table = document.querySelector("table");
const tableBody = table ? table.querySelector("tbody") : null;
const submitButton = form ? form.querySelector('button[type="submit"]') : null; // Pega a referência do botão de submit

// Estado da aplicação: carrega dados salvos ou inicia array vazio
let professores = JSON.parse(localStorage.getItem("professores")) || [];

// Variável global para rastrear se estamos editando e qual índice
let editingIndex = -1; // -1 significa que nenhum professor está sendo editado

// Verifica se os elementos essenciais foram encontrados
if (!form) {
    console.error("Erro: Formulário não encontrado.");
}
if (!table) {
    console.error("Erro: Tabela não encontrada.");
}
if (!tableBody && table) {
    console.warn("Aviso: <tbody> não encontrado.");
}
if (!submitButton && form) {
    console.warn("Aviso: Botão de submit não encontrado no formulário.");
}

// Função para renderizar a tabela com base no array de professores
function renderTable() {
    const targetElement = tableBody || table;
    if (!targetElement) return;

    // Limpa o conteúdo atual para re-renderizar
    targetElement.innerHTML = "";

    professores.forEach((prof, index) => {
        const newRow = targetElement.insertRow();

        newRow.insertCell(0).textContent = prof.nome;
        newRow.insertCell(1).textContent = prof.escola;
        newRow.insertCell(2).textContent = prof.disciplina;
        newRow.insertCell(3).textContent = prof.telefone;

        // Coluna de Ações (Excluir)
        const actionsCell = newRow.insertCell(4);

        // Botão de Edição
        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.classList.add("btn-edit"); // Usa a nova classe definida no CSS
        editBtn.onclick = () => editProfessor(index);
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Excluir";
        deleteBtn.classList.add("btn-delete"); // Usa a classe definida no CSS
        deleteBtn.onclick = () => {
            if (confirm(`Tem certeza que deseja remover o(a) professor(a) ${prof.nome}?`)) {
                removeProfessor(index);
            }
        };
        actionsCell.appendChild(deleteBtn);
    });
}

// Salva no localStorage e atualiza a tela
function saveAndRender() {
    localStorage.setItem("professores", JSON.stringify(professores));
    renderTable();
}

function removeProfessor(index) {
    professores.splice(index, 1);
    saveAndRender();
}

// Função para lidar com a edição de um professor
function editProfessor(index) {
    editingIndex = index;
    const professorToEdit = professores[index];

    document.getElementById("nome").value = professorToEdit.nome;
    document.getElementById("escola").value = professorToEdit.escola;
    document.getElementById("disciplina").value = professorToEdit.disciplina;
    document.getElementById("telefone").value = professorToEdit.telefone;

    if (submitButton) {
        submitButton.textContent = "Atualizar Professor";
    }
}

// Captura o evento de envio do formulário
if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // impede o recarregamento da página

        // Pega os valores dos campos
        const nome = document.getElementById("nome").value.trim();
        const escola = document.getElementById("escola").value.trim();
        const disciplina = document.getElementById("disciplina").value.trim();
        const telefone = document.getElementById("telefone").value.trim();

        // RegEx simples para validar telefone (ex: 11 99999-9999 ou 11 8888-8888)
        const phoneRegex = /^\d{2}\s?\d{4,5}-?\d{4}$/;

        // Validação básica dos campos
        if (!nome || !escola || !disciplina || !telefone) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        if (!phoneRegex.test(telefone)) {
            alert("Por favor, insira um telefone válido (ex: 11 99999-9999).");
            return;
        }

        if (editingIndex !== -1) {
            // Atualiza o professor existente
            professores[editingIndex] = { nome, escola, disciplina, telefone };
            editingIndex = -1; // Reseta o estado de edição
            if (submitButton) {
                submitButton.textContent = "Adicionar Professor"; // Reseta o texto do botão
            }
        } else {
            // Adiciona um novo professor
            professores.push({ nome, escola, disciplina, telefone });
        }
        saveAndRender();
        // Limpa os campos do formulário
        form.reset();
    });
}

// Renderização inicial
renderTable();
