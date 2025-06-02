const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');

const chatController = new ChatController();

router.post('/', chatController.handleIncomingMessage);

module.exports = router;