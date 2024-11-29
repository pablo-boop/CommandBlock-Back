const pool = require("../config/dbConfig");

async function createCandidacy(req, res) {
    const { id_student, id_vacancy, id_company } = req.params;
    const { description } = req.body;

    try {
        // Verificar se todos os campos necessários estão preenchidos
        if (id_student == null || id_vacancy == null || id_company == null) {
            return res.status(400).send({ message: "Preencha todos os campos necessários!" });
        }

        // Verificar o tipo de usuário
        const userTypeCheck = await pool.query(
            'SELECT type FROM users WHERE id = $1',
            [id_student]
        );

        if (userTypeCheck.rows.length === 0) {
            return res.status(404).send({ message: "Usuário não encontrado!" });
        }

        // Verificar se o usuário é um aluno
        if (userTypeCheck.rows[0].type !== 'Aluno') {
            return res.status(403).send({ message: "Apenas alunos podem criar candidaturas!" });
        }

        // Nova verificação: Checar se a candidatura já foi gerenciada
        const managedCandidacyCheck = await pool.query(
            'SELECT managed FROM vacancies WHERE id = $1',
            [id_vacancy]
        );

        console.log({resposta: managedCandidacyCheck});
        
        // if (managedCandidacyCheck.managed == true) {
        //     res.status(400).send({ message: 'Candidatura encerrada' })
        // }

        // // Verificar se já existe uma candidatura do aluno para esta vaga
        // const existingCandidacy = await pool.query(
        //     'SELECT id FROM candidacies WHERE id_student = $1 AND id_vacancy = $2',
        //     [id_student, id_vacancy]
        // );

        // if (existingCandidacy.rows.length > 0) {
        //     return res.status(400).send({ message: "Você já tem uma candidatura para esta vaga!" });
        // }

        // // Criar a candidatura
        // const query = `INSERT INTO candidacies (id_student, id_vacancy, id_company, iniciated, curriculumAvaliation, documentsManagement, done, hired, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

        // await pool.query(query, [id_student, id_vacancy, id_company, true, false, false, false, false, description]);

        // return res.status(201).send({ message: 'Candidatura feita com sucesso!' });

    } catch (error) {
        console.error('Erro ao realizar candidatura:', error.message);
        return res.status(500).send({ message: 'Erro interno ao realizar candidatura.' });
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
    const client = await pool.connect();

    try {
        const { id_vacancy } = req.params;
        const { selectedStudentId } = req.body;

        // Iniciar transação
        await client.query('BEGIN');

        // Verificar se a vaga existe
        const vacancyCheck = await client.query(
            'SELECT id FROM vacancies WHERE id = $1',
            [id_vacancy]
        );

        if (vacancyCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vaga não encontrada.' });
        }

        // Obter todas as candidaturas da vaga
        const candidacies = await client.query(
            `SELECT id, id_student FROM candidacies WHERE id_vacancy = $1`,
            [id_vacancy]
        );

        if (candidacies.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Nenhuma candidatura encontrada.' });
        }

        // Encontrar a candidatura do estudante selecionado
        const selectedCandidacy = candidacies.rows.find(
            (cand) => cand.id_student === selectedStudentId
        );

        if (!selectedCandidacy) {
            return res.status(404).json({
                success: false,
                message: 'Candidatura do estudante selecionado não encontrada.'
            });
        }

        // Filtrar candidaturas duplicadas (excluindo a candidatura do estudante selecionado)
        const duplicates = candidacies.rows.filter(
            (cand) => cand.id_student !== selectedStudentId
        );

        if (duplicates.length === 0) {
            return res.status(404).json({ success: false, message: 'Nenhuma duplicata encontrada.' });
        }

        // Obter os IDs das candidaturas duplicadas
        const duplicateIds = duplicates.map((dup) => dup.id);

        // Excluir candidaturas duplicadas
        const deleteResult = await client.query(
            `DELETE FROM candidacies WHERE id_vacancy = $1 AND id_student != $2 AND id = ANY($3::int[])`,
            [id_vacancy, selectedStudentId, duplicateIds]
        );

        // Mudança do BOOLEAN de managed de vacancies
        await client.query(`
            UPDATE vacancies SET managed = true WHERE id = $1`,
            [id_vacancy]
        );

        // Commit da transação
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Candidatos duplicados removidos com sucesso.',
            deletedIds: duplicateIds,
            selectedCandidacyId: selectedCandidacy.id,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao gerenciar candidaturas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao processar.',
            errorDetails: error.message
        });
    } finally {
        client.release();
    }
}

async function getDuplicateCandidacies(req, res) {
    const { id_vacancy } = req.params;

    try {
        const duplicates = await pool.query(
            `WITH vacancy_duplicates AS (
                SELECT id, id_student, id_vacancy, id_company, description, creation_time
                FROM candidacies
                WHERE id_vacancy = $1
                GROUP BY id, id_student, id_vacancy, id_company, description, creation_time
            )
            SELECT 
                c.id AS candidacy_id,
                c.id_student,
                u.name AS student_name,
                c.id_vacancy,
                v.name AS vacancy_name,
                c.id_company,
                c.description,
                c.creation_time,
                (
                    SELECT COUNT(*) 
                    FROM vacancy_duplicates vd 
                    WHERE vd.description = c.description 
                    AND vd.id_company = c.id_company
                ) AS duplicate_count
            FROM candidacies c
            JOIN users u ON c.id_student = u.id
            JOIN vacancies v ON c.id_vacancy = v.id
            WHERE c.id_vacancy = $1
            AND (
                SELECT COUNT(*) 
                FROM vacancy_duplicates vd 
                WHERE vd.description = c.description 
                AND vd.id_company = c.id_company
            ) > 1
            ORDER BY c.creation_time;`,
            [id_vacancy]
        );

        if (duplicates.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'Nenhuma duplicata encontrada.',
                duplicates: []
            });
        }

        // Agrupar duplicatas por descrição e empresa
        const groupedDuplicates = duplicates.rows.reduce((acc, current) => {
            const duplicateGroup = acc.find(group =>
                group.description === current.description &&
                group.id_company === current.id_company
            );

            if (duplicateGroup) {
                duplicateGroup.candidacies.push({
                    candidacy_id: current.candidacy_id,
                    student_id: current.id_student,
                    student_name: current.student_name,
                    creation_time: current.creation_time
                });
            } else {
                acc.push({
                    description: current.description,
                    id_company: current.id_company,
                    vacancy_id: current.id_vacancy,
                    vacancy_name: current.vacancy_name,
                    duplicate_count: current.duplicate_count,
                    candidacies: [{
                        candidacy_id: current.candidacy_id,
                        student_id: current.id_student,
                        student_name: current.student_name,
                        creation_time: current.creation_time
                    }]
                });
            }

            return acc;
        }, []);

        res.status(200).json({
            success: true,
            message: 'Candidaturas duplicadas encontradas.',
            duplicates: groupedDuplicates
        });
    } catch (error) {
        console.error('Erro ao buscar candidaturas duplicadas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao buscar duplicatas.',
            error: error.message
        });
    }
}

module.exports = {
    createCandidacy,
    getAllCandidacies,
    getCandidacyById,
    editCandidacy,
    deleteCandidacy,
    manageCandidates,
    getDuplicateCandidacies
};