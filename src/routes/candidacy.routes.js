const express = require('express');
const router = express.Router();
const candidacyController = require('../controllers/candidacyController')

router.get('/candidacies', candidacyController.getAllCandidacies);
router.get('/candidacies/:id', candidacyController.getCandidacyById);
router.post('/candidacies/:id_student/:id_vacancy/:id_company', candidacyController.createCandidacy);
router.put('/candidacies/:id/:id_student/:id_vacancy/:id_company', candidacyController.editCandidacy);
router.delete('/candidacies/:id', candidacyController.deleteCandidacy);

module.exports = router;