const pool = require("../config/dbConfig")

async function createVacancy(req, res) {
    const { name, description, creation_time, expiration_time, status, type, students } = req.body;
    const query = `INSERT INTO vacancies (name, description, creation_time, expiration_time, status, type, students) VALUES ($1, $2, $3, $4, $5, $6, $7)`;

    if (name == "" || description == "" || creation_time == null || expiration_time == null || status == "" || type == "") {
        res.status(400).send({
            message: 'Preencha todos os campos'
        });
    } else if (creation_time == expiration_time) {
        res.status(400).send({
            message: 'A data de expiração não pode ser a mesma que a data de criação!'
        });
    } else {
        try {
            await pool.query(query, [name, description, creation_time, expiration_time, status, type, students]);
            res.status(201).send({
                message: 'Vaga cadastrada com sucesso!',
            })
        } catch (error) {
            console.error('Erro ao criar vaga:', error);
            res.status(400).send({
                message: 'Erro ao criar vaga!'
            });
        }
    }

}

async function getAllVacancies(req, res) {
    try {
        const { status } = req.params;
        let result;

        if (status) {
            result = await pool.query('SELECT * FROM vacancies WHERE status = $1', [status]);
        } else {
            result = await pool.query('SELECT * FROM vacancies');
        }

        res.status(200).send({
            message: 'Vagas obtidas com sucesso!',
            totalVacancies: result.rowCount,
            vacancies: result.rows
        });
    } catch (error) {
        console.error('Erro ao obter vagas:', error);
        res.status(500).send('Erro ao obter vagas!');
    }
}

async function getVacancyById(req, res) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM vacancies WHERE id = $1', [id]);

        if (result.rowCount > 0) {
            res.status(200).send({
                message: 'Vaga obtida com sucesso!',
                vacancy: result.rows[0]
            });
        } else {
            res.status(404).send({
                message: 'Vaga não encontrada!'
            });
        }
    } catch (error) {
        console.error('Erro ao obter vagas:', error);
        res.status(500).send('Erro ao obter vaga!');
    }
}

async function editVacancy(req, res) {
    const id = req.params.id;
    const { name, description, creation_time, expiration_time, status, type } = req.body;

    if (!name || !description || !creation_time || !expiration_time || !status || !type) {
        return res.status(400).send({ message: 'Preencha todos os campos' });
    } else if (creation_time === expiration_time) {
        return res.status(400).send({ message: 'A data de expiração não pode ser a mesma que a data de criação!' });
    } else {
        try {
            const query = `UPDATE vacancies SET name=$1, description=$2, creation_time=$3, expiration_time=$4, status=$5, type=$6 WHERE id=$7`;
            const result = await pool.query(query, [name, description, creation_time, expiration_time, status, type, id]);

            if (result.rowCount > 0) {
                return res.send('Vaga atualizada com sucesso');
            } else {
                return res.status(404).send('Vaga não encontrada');
            }
        } catch (error) {
            console.error('Erro ao atualizar vaga:', error);
            return res.status(500).send('Erro ao atualizar vaga!');
        }
    }
}



async function deleteVacancy(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM vacancies WHERE id=$1';

    try {
        const result = await pool.query(query, [id]);

        if (result.rowCount > 0) {
            res.send('Vaga deletada com sucesso');
        } else {
            res.status(404).send('Vaga não encontrada');
        }
    } catch (error) {
        console.error('Erro ao deletar vaga:', error);
        res.status(500).send('Erro ao deletar vaga!');
    }
}

async function addStudentVacancy(req, res) {
    const vacancyId = req.params.id;
    const { studentId } = req.body;

    if (!studentId) {
        return res.status(400).send({ message: 'ID do estudante é necessário' });
    }

    try {
        const vacancyResult = await pool.query('SELECT students FROM vacancies WHERE id=$1', [vacancyId]);
        const vacancy = vacancyResult.rows[0];

        if (!vacancy) {
            return res.status(404).send('Vaga não encontrada');
        }

        const currentStudents = vacancy.students ? vacancy.students : [];

        if (!currentStudents.includes(studentId)) {
            currentStudents.push(studentId);
        }

        const updatedStudentsJson = JSON.stringify(currentStudents);
        await pool.query('UPDATE vacancies SET students=$1 WHERE id=$2', [updatedStudentsJson, vacancyId]);

        return res.send('Estudante adicionado à vaga com sucesso');
    } catch (error) {
        console.error('Erro ao adicionar estudante à vaga:', error);
        return res.status(500).send('Erro ao adicionar estudante à vaga!');
    }
}


module.exports = { createVacancy, getAllVacancies, getVacancyById, editVacancy, deleteVacancy, addStudentVacancy }