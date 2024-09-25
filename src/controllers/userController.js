const pool = require("../config/dbConfig")
const bcrypt = require('bcrypt')
const validarEFormatarData = require('../models/formatarData');
const calcularIdade = require('../models/calcularIdade');

async function createUser(req, res) {
    const { name, birthdate, email, cpf, course, password, type } = req.body;

    try {
        const formattedDate = validarEFormatarData(birthdate);
        const birthDateObj = new Date(formattedDate);
        const idade = calcularIdade(birthDateObj);

        if (isNaN(idade) || idade < 0) {
            return res.status(400).send({ message: 'Idade inválida!' });
        }

        const query = `INSERT INTO users (name, birthdate, age, email, cpf, course, password, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

        const emailAlreadyExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const cpfAlreadyExist = await pool.query('SELECT * FROM users WHERE cpf = $1', [cpf]);

        if (emailAlreadyExist.rowCount > 0) {
            return res.status(400).send({ message: 'Email já cadastrado!' });
        } else if (cpfAlreadyExist.rowCount > 0) {
            return res.status(400).send({ message: 'CPF já cadastrado!' });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await pool.query(query, [name, formattedDate, idade, email, cpf, course, hashedPassword, type]);
            return res.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
        }
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        return res.status(400).send({ message: error.message });
    }
}

async function getAllUsers(req, res) {
    try {
        const { cpf } = req.params;
        let result;

        if (cpf) {
            result = await pool.query('SELECT * FROM users WHERE cpf = $1', [cpf]);
        } else {
            result = await pool.query('SELECT * FROM users');
        }

        res.status(200).send({
            message: 'Usuários obtidos com sucesso!',
            totalUsers: result.rowCount,
            users: result.rows
        });
    } catch (error) {
        console.error('Erro ao obter usuários:', error);
        res.status(500).send('Erro ao obter usuários!');
    }
}

async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (result.rowCount > 0) {
            res.status(200).send({
                message: 'Usuário obtido com sucesso!',
                user: result.rows[0]
            });
        } else {
            res.status(404).send({
                message: 'Usuário não encontrado!'
                });
        }
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        res.status(500).send('Erro ao obter usuário!');
    }
}

async function editUser(req, res) {
    const { id } = req.params;
    const { name, birthdate, email, cpf, course, password, type } = req.body;
    const formattedDate = validarEFormatarData(birthdate)
    const age = calcularIdade(formattedDate);

    try {
        const query = `UPDATE users SET name=$1, birthdate=$2, age=$3 email=$4, cpf=$5, course=$6, password=$7, type=$8 WHERE id=$9`;
        const result = await pool.query(query, [name, birthdate, age, email, cpf, course, password, type, id]);
        
        if (result.rowCount > 0) {
            res.send('Usuário atualizado com sucesso');
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).send('Erro ao atualizar usuário!');
    }
}

async function deleteUser(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE id=$1';
    
    try {
        const result = await pool.query(query, [id]);
        
        if (result.rowCount > 0) {
            res.send('Usuário deletado com sucesso');
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).send('Erro ao deletar usuário!');
    }
}

module.exports = { createUser, getAllUsers, getUserById, editUser, deleteUser }