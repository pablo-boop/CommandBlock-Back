const express = require('express');
const router = express.Router();
const candidacyController = require('../controllers/candidacyController');

// Obter todas as candidaturas
router.get('/candidacies', candidacyController.getAllCandidacies);

// Obter uma candidatura específica por ID
router.get('/candidacies/:id', candidacyController.getCandidacyById);

// Criar uma nova candidatura
router.post('/candidacies/:id_student/:id_vacancy/:id_company', candidacyController.createCandidacy);

// Editar uma candidatura existente
router.put('/candidacies/:id/:id_student/:id_vacancy/:id_company', candidacyController.editCandidacy);

// Deletar uma candidatura
router.delete('/candidacies/:id', candidacyController.deleteCandidacy);

// Obter candidaturas de uma vaga gerenciada
router.get('/manage-candidates/:id_vacancy', candidacyController.getManagedCandidacy);

// Buscar candidaturas duplicadas
router.get('/duplicate-candidates/:id_vacancy', candidacyController.getDuplicateCandidacies);

// Gerenciar candidatos
router.post('/manage-candidates/:id_vacancy', candidacyController.manageCandidates);

module.exports = router;