const pool = require("../config/dbConfig")
const bcrypt = require('bcrypt')
const formatarData = require("../models/formatarData")

async function createUser(req, res) {
    const { name, birthdate, email, cpf, course, password, type } = req.body;
    const query = 'INSERT INTO users (name, birthdate, email, cpf, course, password, type) VALUES ($1, $2, $3, $4, $5, $6, $7)';

    try {
        const emailAlreadyExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const cpfAlreadyExist = await pool.query('SELECT * FROM users WHERE cpf = $1', [cpf]);

        if (emailAlreadyExist.rowCount > 0) {
            res.status(400).send({
                message: 'Email já cadastrado!'
            });
        }
        else if (cpfAlreadyExist.rowCount > 0) {
            res.status(400).send({
                message: 'CPF já cadastrado!'
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await pool.query(query, [name, birthdate, email, cpf, course, hashedPassword, type]);
            res.status(201).send({
                message: 'Usuario cadastrado com sucesso!',
            })
        }
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(400).send({
            message: 'Erro ao criar usuário!'
        });
    }
}

async function getAllUsers(req, res) {
    try {
        const { cpf } = req.body;
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
module.exports = { createUser, getAllUsers }