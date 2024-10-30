const pool = require("../config/dbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validarEFormatarData = require('../models/formatarData');
const calcularIdade = require('../models/calcularIdade');
const formatarCPF = require("../models/formatarCPF");
const validarCPF = require("../models/validarCPF");

async function login(req, res) {
    const { email, password } = req.body;

    console.log(email);
    

    try {
        // Verifica se o usuário existe no banco de dados
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        console.log(user);
        

        if (!user) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
        }

        // Comparar a senha fornecida com a senha armazenada (assumindo que está criptografada)
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send({ message: 'Senha incorreta' });
        }

        // Se o token estiver vazio ou nulo, gere um novo
        if (user.token == '') {
            // Gerar novo token JWT
            console.log("passou")
            const newToken = jwt.sign(
                { id: user.id, email: user.email }, // Payload com dados do usuário
                process.env.JWT_SECRET_KEY,  // Chave secreta
                { expiresIn: process.env.EXPIRES_IN }  // Tempo de expiração do token
            );

            // Atualizar o token no banco de dados
            await pool.query('UPDATE users SET token = $1 WHERE email = $2', [newToken, email]);

            // Retornar o novo token
            return res.status(200).json({
                message: 'Login bem-sucedido',
                token: newToken
            });
        } else {
            // Verifica se o token existente é válido
            jwt.verify(user.token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
                if (err) {
                    // Verifica se o erro é do tipo TokenExpiredError
                    if (err.name === 'TokenExpiredError') {
                        // Gerar um novo token JWT
                        const newToken = jwt.sign(
                            { id: user.id, email: user.email }, // Payload com dados do usuário
                            process.env.JWT_SECRET_KEY,  // Chave secreta
                            { expiresIn: process.env.EXPIRES_IN }  // Tempo de expiração do token
                        );

                        // Atualizar o token no banco de dados
                        await pool.query('UPDATE users SET token = $1 WHERE email = $2', [newToken, email]);

                        // Retornar o novo token
                        return res.status(200).json({
                            message: 'Token renovado',
                            token: newToken
                        });
                    } else {
                        // Se o token for inválido
                        return res.status(403).send({ message: 'Token inválido' });
                    }
                } else {
                    // Se o token já existir e for válido, retorne o token existente
                    return res.status(200).json({
                        message: 'Login bem-sucedido',
                        token: user.token
                    });
                }
            });
        }

    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        return res.status(500).send({ message: 'Erro interno no servidor' });
    }
}
async function createUser(req, res) {
        const { name, birthdate, email, cpf, course, password, type } = req.body;

        try {
            if (validarCPF(cpf) == false) {
                return res.status(400).send({ message: 'CPF inválido!' });
            } else {
                const formattedCPF = formatarCPF(cpf);
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

                    await pool.query(query, [name, formattedDate, idade, email, formattedCPF, course, hashedPassword, type]);
                    return res.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
                }
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
        // console.log(birthdate)

        try {
            const birthDateObj = validarEFormatarData(birthdate);

            if (!birthDateObj || isNaN(birthDateObj.getTime())) {
                return res.status(400).send('Data de nascimento inválida.');
            }

            const age = calcularIdade(birthDateObj);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = `UPDATE users SET name=$1, birthdate=$2, age=$3, email=$4, cpf=$5, course=$6, password=$7, type=$8 WHERE id=$9`;
            const result = await pool.query(query, [name, birthDateObj, age, email, cpf, course, hashedPassword, type, id]);

            if (result.rowCount > 0) {
                res.send({ message: 'Usuário atualizado com sucesso' });
            } else {
                res.status(404).send({ message: 'Usuário não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(400).send(error.message);
        }
    }

    async function deleteUser(req, res) {
        const { id } = req.params;
        const query = 'DELETE FROM users WHERE id=$1';

        try {
            const result = await pool.query(query, [id]);

            if (result.rowCount > 0) {
                res.send({ message: 'Usuário deletado com sucesso' });
            } else {
                res.status(404).send({ message: 'Usuário não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).send('Erro ao deletar usuário!');
        }
    }

    module.exports = { createUser, getAllUsers, getUserById, editUser, deleteUser, login }