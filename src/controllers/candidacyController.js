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

        // Verificar se a vaga já foi gerenciada (managed = true)
        const managedCandidacyCheck = await pool.query(
            'SELECT managed FROM vacancies WHERE id = $1',
            [id_vacancy]
        );

        if (managedCandidacyCheck.rows[0].managed === true) {
            return res.status(400).send({ message: 'Esta vaga já foi gerenciada e não aceita mais candidaturas.' });
        }

        // Verificar se já existe uma candidatura do aluno para esta vaga
        const existingCandidacy = await pool.query(
            'SELECT id FROM candidacies WHERE id_student = $1 AND id_vacancy = $2',
            [id_student, id_vacancy]
        );

        if (existingCandidacy.rows.length > 0) {
            return res.status(400).send({ message: "Você já tem uma candidatura para esta vaga!" });
        }

        // Criar a candidatura
        const query = `INSERT INTO candidacies (id_student, id_vacancy, id_company, iniciated, curriculumAvaliation, documentsManagement, done, hired, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

        await pool.query(query, [id_student, id_vacancy, id_company, true, false, false, false, false, description]);

        return res.status(201).send({ message: 'Candidatura feita com sucesso!' });

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
        const duplicates = await pool.query(`
            SELECT 
                c.id,
                c.id_student,
                c.id_vacancy,
                c.iniciated,
                c.curriculumAvaliation,
                c.documentsManagement,
                c.done,
                c.hired,
                c.description,
                u.name AS student_name,
                u.email AS student_email,
                u.course AS student_course,
                v.name AS vacancy_name,
                v.description AS vacancy_description,
                v.type AS vacancy_type,
                v.expiration_time AS vacancy_expiration,
                co.name AS company_name
            FROM candidacies c
            JOIN users u ON c.id_student = u.id
            JOIN vacancies v ON c.id_vacancy = v.id
            JOIN companies co ON c.id_company = co.id
            WHERE c.id_vacancy = $1
            ORDER BY c.creation_time
        `, [id_vacancy]);

        res.status(200).json({
            success: true,
            message: 'Candidaturas encontradas.',
            total: duplicates.rowCount,
            candidacies: duplicates.rows.map(dup => ({
                id: dup.id,
                student: {
                    id: dup.id_student,
                    name: dup.student_name,
                    email: dup.student_email,
                    course: dup.student_course
                },
                vacancy: {
                    id: dup.id_vacancy,
                    name: dup.vacancy_name,
                    description: dup.vacancy_description,
                    type: dup.vacancy_type,
                    expiration_time: dup.vacancy_expiration,
                    company_name: dup.company_name
                },
                status: {
                    iniciated: dup.iniciated,
                    curriculumAvaliation: dup.curriculumAvaliation,
                    documentsManagement: dup.documentsManagement,
                    done: dup.done,
                    hired: dup.hired
                },
                description: dup.description
            }))
        });

    } catch (error) {
        console.error('Erro ao buscar candidaturas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao buscar candidaturas.',
            error: error.message
        });
    }
}

async function getManagedCandidacy(req, res) {
    try {
        const { id_vacancy } = req.params;

        // Verificar se a vaga está marcada como managed
        const vacancyCheck = await pool.query(
            'SELECT managed FROM vacancies WHERE id = $1',
            [id_vacancy]
        );

        if (vacancyCheck.rows.length === 0) {
            return res.status(404).send({
                message: 'Vaga não encontrada!'
            });
        }

        // Se a vaga não estiver managed, retornar mensagem
        if (vacancyCheck.rows[0].managed !== true) {
            return res.status(400).send({
                message: 'Esta vaga ainda não foi gerenciada.'
            });
        }

        // Buscar as candidaturas da vaga gerenciada
        const candidacies = await pool.query(
            'SELECT * FROM candidacies WHERE id_vacancy = $1',
            [id_vacancy]
        );

        if (candidacies.rows.length === 0) {
            return res.status(404).send({
                message: 'Nenhuma candidatura encontrada para esta vaga gerenciada.'
            });
        }

        res.status(200).send({
            message: `Candidaturas da vaga ${id_vacancy} encontradas com sucesso!`,
            candidacies: candidacies.rows
        });

    } catch (error) {
        console.error('Erro ao obter candidaturas:', error);
        res.status(500).send('Erro interno ao obter candidaturas!');
    }
}

async function updateCandidacyStatus(req, res) {
    const { id } = req.params;
    const { field } = req.body;

    // List of valid fields that can be updated
    const validFields = [
        'iniciated',
        'curriculumAvaliation',
        'documentsManagement',
        'done',
        'hired'
    ];

    if (!validFields.includes(field)) {
        return res.status(400).json({
            success: false,
            message: 'Campo inválido para atualização.'
        });
    }

    try {
        const query = `
            UPDATE candidacies 
            SET ${field} = true, 
                modification_data = $1 
            WHERE id = $2
        `;

        const data = new Date();
        const result = await pool.query(query, [data, id]);

        if (result.rowCount > 0) {
            res.status(200).json({
                success: true,
                message: `Status de ${field} atualizado com sucesso.`
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Candidatura não encontrada.'
            });
        }
    } catch (error) {
        console.error('Erro ao atualizar status da candidatura:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno ao atualizar status.',
            errorDetails: error.message
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
    getDuplicateCandidacies,
    getManagedCandidacy,
    updateCandidacyStatus
};