const pool = require("../config/dbConfig");
const formatarCNPJ = require("../models/formatarCNPJ");
const formatarTelefone = require("../models/formatarTelefone");

async function createCompany(req, res) {
    const { name, cnpj, email, phone } = req.body;

    try {
        if (name == "" || cnpj == "" || email == "" || phone == "") {
            return res.status(400).send({message: "Preencha todos os campos necessários!"})
        }
        const cnpjFormated = formatarCNPJ(cnpj);
        const phoneFormated = formatarTelefone(phone);
        const query = `INSERT INTO companies (name, cnpj, email, phone) VALUES ($1, $2, $3, $4)`;

        const cnpjAlreadyExist = await pool.query('SELECT * FROM companies WHERE cnpj = $1', [cnpj]);
        const emailAlreadyExist = await pool.query('SELECT * FROM companies WHERE email = $1', [email]);

        if (emailAlreadyExist.rowCount > 0) {
            return res.status(400).send({ message: 'Email já cadastrado!' });
        } else if (cnpjAlreadyExist.rowCount > 0) {
            return res.status(400).send({ message: 'CNPJ já cadastrado!' });
        } else {
            await pool.query(query, [name, cnpjFormated, email, phoneFormated]);
            return res.status(201).send({ message: 'Empressa cadastrada com sucesso!' });
        }
    } catch (error) {
        console.error('Erro ao criar empressa:', error.message);
        return res.status(400).send({ message: error.message });
    }
}


async function getAllCompanies(req, res) {
    try {
        const { cnpj } = req.params;
        let result;

        if (cnpj) {
            result = await pool.query('SELECT * FROM companies WHERE cnpj = $1', [cnpj]);
        } else {
            result = await pool.query('SELECT * FROM companies');
        }

        res.status(200).send({
            message: 'Empressas obtidas com sucesso!',
            totalCompanies: result.rowCount,
            companies: result.rows
        });
    } catch (error) {
        console.error('Erro ao obter empressas:', error);
        res.status(500).send('Erro ao obter empressas!');
    }
}

async function getCompanyById(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
        
        if (result.rowCount > 0) {
            res.status(200).send({
                message: 'Empressa obtido com sucesso!',
                company: result.rows[0]
            });
        } else {
            res.status(404).send({
                message: 'Empressa não encontrado!'
                });
        }
    } catch (error) {
        console.error('Erro ao obter empressa:', error);
        res.status(500).send('Erro ao obter empressa!');
    }
}

async function editCompany(req, res) {
    const { id } = req.params;
    const { name, cnpj, email, phone } = req.body;

    const cnpjFormated = formatarCNPJ(cnpj);
    const phoneFormated = formatarTelefone(phone);

    try {
        const query = `UPDATE companies SET name=$1, cnpj=$2, email=$3, phone=$4 WHERE id=$5`;
        const result = await pool.query(query, [name, cnpjFormated, email, phoneFormated, id]);
        
        if (result.rowCount > 0) {
            res.send('Empressa atualizada com sucesso');
        } else {
            res.status(404).send('Empressa não encontrada');
        }
    } catch (error) {
        console.error('Erro ao atualizar Empressa:', error);
        res.status(500).send('Erro ao atualizar Empressa!');
    }
}

async function deleteCompany(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM companies WHERE id=$1';
    
    try {
        const result = await pool.query(query, [id]);
        
        if (result.rowCount > 0) {
            res.send('Empressa deletada com sucesso');
        } else {
            res.status(404).send('Empressa não encontrada');
        }
    } catch (error) {
        console.error('Erro ao deletar empressa:', error);
        res.status(500).send('Erro ao deletar empressa!');
    }
}

module.exports = { createCompany, getAllCompanies, getCompanyById, editCompany, deleteCompany }