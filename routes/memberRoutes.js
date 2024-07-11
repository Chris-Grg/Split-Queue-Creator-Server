const express = require('express');
const router= express.Router();
const {addMembers,removeMembers,updateMembers}= require('../controllers/memberController');
const { validateMemberCreate, validateUpdateQueue, validateMemberCreateOrDelete, validateMemberUpdate } = require('../middleware/validator');

router.get('/',(req,res)=>{
    res.send('WELCOME TO QUEUE CONFIG GENERATOR')
})
router.post('/add',validateMemberCreateOrDelete,async(req,res)=>{
    try {
        const { name, queue } = req.body
        const response = await addMembers(queue, name)
        res.send(response)
    }
    catch (err) {
        
        res.status(400).json({error:err.message})
    }
})
router.delete('/delete',validateMemberCreateOrDelete,async(req,res)=>{
    try {
        const { queue,name} = req.body
        const response = await removeMembers(queue,name)
        res.send(response)
    }
    catch (err) {
        res.status(400).json({error:err.message})
    }
})
router.patch('/update',validateMemberUpdate,async(req,res)=>{
    try {
        const { name, queue, newname, newqueue} = req.body
        const response = await updateMembers(queue, name, newname, newqueue)
        res.send(response)
    }
    catch (err) {
        res.status(400).json({error:err.message})
    }
})

module.exports=router;
