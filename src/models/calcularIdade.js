function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const dataNascimentoDate = new Date(dataNascimento);
    let idade = hoje.getFullYear() - dataNascimentoDate.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = dataNascimentoDate.getMonth();
    if (mesNascimento > mesAtual || (mesNascimento === mesAtual && hoje.getDate() < dataNascimentoDate.getDate())) {
        idade--;
    }
    return idade;
}

module.exports = calcularIdade;