const db = require('../db/connection');
const queueController = require('./queueController');

const addMembers =(queue, name)=>{
    return new Promise((resolve,reject)=>{
        const selectQuery =`SELECT * from members WHERE members.queue = ? AND members.name = ?`
        db.query(selectQuery, [queue,name],(err,res)=>{
            if(err)  reject(err);
            if(res.length>0){
                 reject(new Error('Member already exists'));
            }
            const insertQuery = `INSERT INTO members (queue,name) VALUES (?,?)`
            db.query(insertQuery, [queue,name],(err,res)=>{
                if(err) reject(err);
                else{
                    queueController.createConfigFile()
                    resolve('member added')
                };
            })
        })
    })
}
const removeMembers=(queue,name)=>{
return new Promise((resolve,reject)=>{
const selectMemberQuery = `SELECT * from members WHERE members.queue = ? AND members.name = ?`
    db.query(selectMemberQuery, [queue,name],(err,res)=>{
        if(err) return reject(err);
        if(res.length===0){
         reject(new Error('Member not found'));
        }
        const deleteQuery = `DELETE FROM members WHERE members.queue =? AND members.name =?`
        db.query(deleteQuery, [queue,name],(err,res)=>{
            if(err) return reject(err);
            else{queueController.createConfigFile()

            resolve(`name: ${name} queue: ${queue} deleted`);}
        })
    })

})

}
const updateMembers=(queue,name, newname, newqueue)=>{
return new Promise((resolve,reject)=>{
    const selectMemberQuery = `SELECT * from members WHERE members.queue =? AND members.name =?`
    db.query(selectMemberQuery, [queue,name],(err,res)=>{
        if(err) return reject(err);
        if(res.length===0){
            return reject(new Error('Member not found'));
        }
        db.query(selectMemberQuery,[newqueue,newname],(err,res)=>{
            if(err) return reject(err);
            if(res.length>0){
                return reject(new Error('Member already exists in new queue'));
            }
        const updateQuery = `UPDATE members SET members.name =?, members.queue=? WHERE members.queue =? AND members.name =?`
        db.query(updateQuery, [newname,newqueue,queue,name],(err,res)=>{
            if(err) return reject(err);
            else{queueController.createConfigFile()
            resolve(`Queue: ${queue} Name: ${name} updated`);}
        })
    })
    })
 
})
}

exports.addMembers = addMembers;
exports.removeMembers = removeMembers;
exports.updateMembers = updateMembers;