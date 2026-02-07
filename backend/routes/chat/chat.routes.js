const express = require('express')
const chatController = require('../../controller/chatController/chat')
const router = express.Router()

router.post('/send' ,chatController.chatBoat )



module.exports = router