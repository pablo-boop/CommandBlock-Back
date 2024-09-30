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
    const { iniciated, curriculumAvaliation, documentsManagement, done, hired, description, modification_data } = req.body;

    try {
        const query = `UPDATE candidacies SET id_student=$1, id_vacancy=$2, id_company=$3, iniciated=$4, curriculumAvaliation=$5, documentsManagement=$6, done=$7, hired=$8, description=$9, modification_data=$10 WHERE id=$11`;
        const result = await pool.query(query, [id_student, id_vacancy, id_company, iniciated, curriculumAvaliation, documentsManagement, done, hired, description, modification_data, id]);

        if (result.rowCount > 0) {
            res.send('Candidatura atualizada com sucesso');
        } else {
            res.status(404).send('Candidatura não encontrada');
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
        const { id_vacancy, id_student } = req.params;

        // Obter candidaturas duplicadas
        const duplicateCandidatures = await pool.query(`
        WITH ranked_candidates AS (
          SELECT c.id_student AS candidate_id
          FROM candidacies c
          WHERE c.id_vacancy = $1
          GROUP BY c.id_student
          ORDER BY COUNT(*) DESC
        )
        SELECT candidate_id
        FROM ranked_candidates
        WHERE rank > 1
      `, [id_vacancy]);

        if (duplicateCandidatures.rows.length === 0) {
            return res.status(200).json({ success: true, message: 'Não há candidaturas duplicadas para esta vaga.' });
        }

        // Atualizar candidaturas
        const updateQuery = `
        UPDATE candidacies
        SET id_student = $1
        FROM (
          SELECT id, id_student
          FROM candidacies
          WHERE id_vacancy = $2
          AND id_student IN ($3, $4)
        ) temp
        WHERE candidacies.id = temp.id
      `;
        const result = await pool.query(updateQuery, [id_student, id_vacancy, duplicateCandidatures.rows[0].candidate_id, duplicateCandidatures.rows[1].candidate_id]);

        if (result.rowCount === 0) {
            return res.status(500).json({ success: false, message: 'Não foi possível atualizar as candidaturas.' });
        }

        return res.status(200).json({ success: true, message: 'Candidaturas atualizadas com sucesso.' });
    } catch (error) {
        console.error('Erro ao gerenciar candidaturas:', error);
        return res.status(500).json({ success: false, message: 'Erro interno ao processar sua solicitação.' });
    }
}

module.exports = { createCandidacy, getAllCandidacies, getCandidacyById, editCandidacy, deleteCandidacy, manageCandidates }