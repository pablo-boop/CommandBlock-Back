const pool = require("../config/dbConfig");

async function createCandidacy(req, res) {
    const { id_student, id_vacancy, id_company } = req.params;
    const { description } = req.body;

    try {
        if (id_student == null || id_vacancy == null || id_company == null) {
            return res.status(400).send({ message: "Preencha todos os campos necessários!" })
        } else {
            console.log(id_student, id_vacancy, id_company);

            const query = `INSERT INTO candidacies (id_student, id_vacancy, id_company, iniciated, curriculumAvaliation, documentsManagement, done, hired, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

            await pool.query(query, [id_student, id_vacancy, id_company, true, false, false, false, false, description]);
            return res.status(201).send({ message: 'Candidatura feita com sucesso!' });

        }
    } catch (error) {
        console.error('Erro ao realizar candidatura:', error.message);
        return res.status(400).send({ message: error.message });
    }
}


async function getAllCandidacies(req, res) {
    try {
        const result = await pool.query('SELECT * FROM candidacies');

        res.status(200).send({
            message: 'Candidaturas obtidas com sucesso!',
            totalCandidacies: result.rowCount,
            candidacies: result.rows
        });
    } catch (error) {
        console.error('Erro ao obter candidaturas:', error);
        res.status(500).send('Erro ao obter candidaturas!');
    }
}

async function getCandidacyById(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM candidacies WHERE id = $1', [id]);

        if (result.rowCount > 0) {
            res.status(200).send({
                message: 'Candidatura obtida com sucesso!',
                candidacy: result.rows[0]
            });
        } else {
            res.status(404).send({
                message: 'Candidatura não encontrada!'
            });
        }
    } catch (error) {
        console.error('Erro ao obter candidatura:', error);
        res.status(500).send('Erro ao obter candidatura!');
    }
}

async function editCandidacy(req, res) {
    const { id, id_student, id_vacancy, id_company } = req.params;
    const { iniciated, curriculumAvaliation, documentsManagement, done, hired, description } = req.body;

    try {
        const data = new Date();
        const query = `UPDATE candidacies SET id_student=$1, id_vacancy=$2, id_company=$3, iniciated=$4, curriculumAvaliation=$5, documentsManagement=$6, done=$7, hired=$8, description=$9, modification_data=$10 WHERE id=$11`;
        const result = await pool.query(query, [id_student, id_vacancy, id_company, iniciated, curriculumAvaliation, documentsManagement, done, hired, description, data, id]);
        console.log(data)
        if (result.rowCount > 0) {
            res.send({ message: 'Candidatura atualizada com sucesso' });
        } else {
            res.status(404).send({ message: 'Candidatura não encontrada' });
        }
    } catch (error) {
        console.error('Erro ao atualizar Candidatura:', error);
        res.status(500).send('Erro ao atualizar Candidatura!');
    }
}

async function deleteCandidacy(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM candidacies WHERE id=$1';

    try {
        const result = await pool.query(query, [id]);

        if (result.rowCount > 0) {
            res.send({ message: 'Candidatura deletada com sucesso' });
        } else {
            res.status(404).send({ message: 'Candidatura não encontrada' });
        }
    } catch (error) {
        console.error('Erro ao deletar candidatura:', error);
        res.status(500).send('Erro ao deletar candidatura!');
    }
}

async function manageCandidates(req, res) {
    try {
        const { id_vacancy } = req.params;
        const { selectedStudentCpf } = req.body; // CPF do aluno escolhido

        // Obter candidaturas duplicadas para a vaga específica
        const duplicateCandidatures = await pool.query(
            `SELECT u.name AS student_name, u.cpf, v.name AS vacancy_name
            FROM users u
            JOIN candidacies c1 ON u.id = c1.id_student
            JOIN vacancies v ON c1.id_vacancy = v.id
            JOIN candidacies c2 ON c1.id_vacancy = c2.id_vacancy AND c1.id_student != c2.id_student
            ORDER BY vacancy_name, student_name;`, [id_vacancy]);

        if (duplicateCandidatures.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Nenhuma candidatura duplicada encontrada.' });
        }

        // Excluir todos os alunos que não são o selecionado
        await pool.query(
            `DELETE FROM candidacies
            WHERE id_vacancy = $1
            AND id_student IN (SELECT id FROM users WHERE cpf != $2);`,
            [id_vacancy, selectedStudentCpf]);

        res.status(200).json({ success: true, message: 'Candidatos duplicados removidos com sucesso, candidato escolhido permanece.' });

    } catch (error) {
        console.error('Erro ao gerenciar candidaturas:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao processar sua solicitação.' });
    }
}

module.exports = { createCandidacy, getAllCandidacies, getCandidacyById, editCandidacy, deleteCandidacy, manageCandidates }