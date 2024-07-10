const db = require('../db/connection');

const addMembers =(queue, name)=>{
    return new Promise((resolve,reject)=>{
        const selectQuery =`SELECT * from members WHERE members.queue = ? AND members.name = ?`
        db.query(selectQuery, [queue,name],(err,res)=>{
            if(err) return reject(err);
            if(res.length>0){
                return reject(new Error('Member already exists'));
            }
            const insertQuery = `INSERT INTO members (queue,name) VALUES (?,?)`
            db.query(insertQuery, [queue,name],(err,res)=>{
                if(err) return reject(err);
                resolve(res);
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
            return reject(new Error('Member not found'));
        }
        const deleteQuery = `DELETE FROM members WHERE members.queue =? AND members.name =?`
        db.query(deleteQuery, [queue,name],(err,res)=>{
            if(err) return reject(err);
            resolve(res);
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
        const updateQuery = `UPDATE members SET members.name =? WHERE members.queue =? AND members.name =?`
        db.query(updateQuery, [newName,queue,name],(err,res)=>{
            if(err) return reject(err);
            resolve(res);
        })
    })
    })
 
})
}

exports.addMembers = addMembers;
exports.removeMembers = removeMembers;
exports.updateMembers = updateMembers;