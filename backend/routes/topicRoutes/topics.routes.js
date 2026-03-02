const express = require('express')
const topicController = require('../../controller/topicController/topic');
const { allow } = require('../../middleware/auth');
const router = express.Router()
const superAdmin = allow('SUPER_ADMIN');

router.post('/addtopic' ,superAdmin, topicController.addTopic)
router.get('/alltopics' , superAdmin , topicController.getAllTopics)
router.get('/newtopics' ,  topicController.getNewestTopics)
router.delete('/deltopic/:id' , superAdmin , topicController.deleteTopic)
router.get('/spetopic/:id' , superAdmin , topicController.getTopicById)
router.patch('/updatetopic/:id' , superAdmin , topicController.updateTopic)

module.exports = router