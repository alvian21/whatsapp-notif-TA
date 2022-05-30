const { Router } = require('express')
const { showData } = require('../controllers/socket')

const router = Router()

router.post('/send-notification', showData)

module.exports = router;

