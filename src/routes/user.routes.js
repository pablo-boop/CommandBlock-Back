const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.editUser);
router.delete('/users/:id', userController.deleteUser);
router.put('/login', userController.login);

module.exports = router;