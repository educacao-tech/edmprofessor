// script.js

// Seleciona o formulário e a tabela
const form = document.querySelector("form");
const table = document.querySelector("table");

// Captura o evento de envio do formulário
form.addEventListener("submit", function(event) {
    event.preventDefault(); // impede o recarregamento da página

    // Pega os valores dos campos
    const nome = document.getElementById("nome").value;
    const disciplina = document.getElementById("disciplina").value;
    const telefone = document.getElementById("telefone").value;

    // Cria uma nova linha na tabela
    const newRow = table.insertRow();

    // Cria as células e insere os valores
    const cellNome = newRow.insertCell(0);
    const cellDisciplina = newRow.insertCell(1);
    const cellTelefone = newRow.insertCell(2);

    cellNome.textContent = nome;
    cellDisciplina.textContent = disciplina;
    cellTelefone.textContent = telefone;

    // Limpa os campos do formulário
    form.reset();
});
