const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Routes
router.get('/view/tovar', stockController.list);
router.get('/view/tovar/:id', stockController.view);
router.post('/add/tovar', stockController.add);

module.exports = router;

