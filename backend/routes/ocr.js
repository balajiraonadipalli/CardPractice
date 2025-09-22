const express = require('express');
const router = express.Router();
const { upload, processOCR, getOCRStatus } = require('../controllers/ocrController');
const { authenticate } = require('../middleware/auth');

// OCR routes (authenticated users only)
router.post('/', authenticate, upload.single('image'), processOCR);
router.get('/status', getOCRStatus);

module.exports = router;
