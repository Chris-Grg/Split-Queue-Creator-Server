const express = require('express');
const router= express.Router();
const {createNewQueue,updateQueue,deleteQueue,createConfigFile}= require('../controllers/queueController');
const { validateCreate, validateUpdateQueue, validateDelete } = require('../middleware/validator');

router.get('/',(req,res)=>{
    res.send('WELCOME TO QUEUE CONFIG GENERATOR')
})

router.post('/create',validateCreate, async (req, res) => {
    try {
        const queue = req.body
        const response = await createNewQueue(queue)
        console.log(response)
        res.send(response)
    }
    catch (err) {
        console.log('ERR::::::', err)
        res.status(400).json({error:err.message})
    }

})
router.patch('/update',validateUpdateQueue, async (req, res) => {
    try {
        const { newname, ...queue } = req.body
        const response = await updateQueue(newname, queue)
        res.send(response)
    }
    catch (err) {
        res.status(400).json({error:err.message})
    }

})
router.delete('/delete',validateDelete, async (req, res) => {
    try {
        const {queue_name} = req.body
        const response = await deleteQueue(queue_name)
        res.send(response)
    }
    catch (err) {
        res.status(400).json({error:err.message})


    }

})
router.post('/generate', async (req, res) => {
    try {
        res.send(await createConfigFile())
    }
    catch (err) {
        throw new Error(err)
    }
})

module.exports = router; 