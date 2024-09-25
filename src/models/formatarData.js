function validarEFormatarData(data) {
    const partes = data.split('-');
    if (partes.length !== 3) {
        throw new Error('Data inválida! Use o formato DD-MM-AAAA.');
    }

    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const ano = parseInt(partes[2], 10);

    const dataObj = new Date(ano, mes, dia);
    if (dataObj.getFullYear() !== ano || dataObj.getMonth() !== mes || dataObj.getDate() !== dia) {
        throw new Error('Data inválida! Verifique os valores fornecidos.');
    }

    return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

module.exports = validarEFormatarData;