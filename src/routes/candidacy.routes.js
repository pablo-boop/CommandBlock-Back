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

// Gerenciar candidatos duplicados para uma vaga específica
// Como o método POST já é usado para criar candidaturas, evite confusão e use um nome de rota exclusivo para esta ação
router.post('/manage-candidates/:id_vacancy', candidacyController.manageCandidates);

module.exports = router;