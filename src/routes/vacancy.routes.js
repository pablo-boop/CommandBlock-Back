const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController')

router.get('/vacancies', vacancyController.getAllVacancies);
router.get('/vacancies/:id', vacancyController.getVacancyById);
router.post('/vacancies', vacancyController.createVacancy);
router.put('/vacancies/:id', vacancyController.editVacancy);
router.delete('/vacancies/:id', vacancyController.deleteVacancy);
router.post('/vacancies/:id/students', vacancyController.addStudentVacancy)

module.exports = router;