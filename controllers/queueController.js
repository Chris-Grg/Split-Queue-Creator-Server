// controllers/queueController.js
const fs = require('fs');
const db = require('../db/connection');
const ami = require('./amiController')

const createNewQueue = async (queue) => {
    return new Promise((resolve, reject) => {
        const selectQuery = 'SELECT queue_name FROM queues WHERE queue_name = ?'
        db.query(selectQuery, [queue.queue_name], async (err, res) => {
            if (err) {
                reject(new Error(err))
            }
            else if (res.length > 0) {
                reject(new Error(`Queue ${queue.queue_name} already exists.`))
            } 
            else {
                const insertQuery = 'INSERT INTO queues (queue_name, strategy, ringinuse, timeout, wrapuptime) VALUES (?, ?, ?, ?, ?)';
                db.query(insertQuery, [queue.queue_name, queue.strategy, queue.ringinuse, queue.timeout, queue.wrapuptime], (err, result) => {
                    if (err) reject(new Error(err))
                    else {
                        createConfigFile()
                        resolve(`New queue added successfully with ID: ${result.insertId}`)
                    }
                })
            }
        })
    })

}
const deleteQueue = async (queue_name) => {
    return new Promise((resolve, reject) => {
        const selectQuery = 'SELECT queue_name FROM queues WHERE queue_name = ?'
        db.query(selectQuery, [queue_name], async(err,res)=>{
if(err) reject(new Error(err))
else if (res.length===0){
reject(new Error(`Queue ${queue_name} doesn't exist`))
}
else{
        const deleteQuery = `DELETE FROM queues WHERE queue_name= ?`
       db.query(deleteQuery,[queue_name], (err, result) => {
            if (err) reject(new Error(err.message))
            else {
                createConfigFile()
                 .then(()=>{

                     resolve(`${queue_name} queue removed successfully`)
                 })
                 .catch(configErr => {
                     console.error('Error creating config file:', configErr);
                     reject(new Error('Member added but failed to update config'));
                 });
                }

              })
    }
       } )
})
}

const updateQueue = async (newname, queue) => {
    return new Promise((resolve, reject) => {
        const selectQuery = 'SELECT queue_name FROM queues WHERE queue_name = ?'
        db.query(selectQuery,[queue.queue_name], async (err, res) => {
            if (err) reject(new Error(err))
            else if (res.length === 0) {
                reject(new Error(`Queue ${queue.queue_name} doesn't exist.`))
            }
            db.query(selectQuery,[newname], async (err, res) => {
                if (err) reject(new Error(err))
                else if (res.length > 0) {
                    reject(new Error(`Queue name ${newname} already exists`))
                }
                else {
                    const updateQuery = `UPDATE queues SET queue_name=?, strategy=?,ringinuse=?,timeout=?, wrapuptime=? WHERE queue_name=?`;
                    db.query(updateQuery,[newname,queue.strategy,queue.ringinuse,queue.timeout,queue.wrapuptime,queue.queue_name], (err, result) => {
                        if (err) reject(new Error(err))
                        else {
                            createConfigFile()
                                .then(() => resolve('Queue updated successfully'))
                                .catch(configErr => {
                                    console.error('Error creating config file:', configErr);
                                    reject(new Error('Member added but failed to update config'));
                                });
    
                        }
                    })
                }
            })
        })
    })
}

const createConfigFile = async () => {
    return new Promise((resolve, reject) => {
        const selectQuery = 'SELECT queue_name, strategy, ringinuse, timeout, wrapuptime FROM queues'
        db.query(selectQuery, (err, results) => {
            if (err) {
                reject(new Error(`ERROR:::::::${err}`));
            } else {
                let configFileContent = '';

                const queuePromises = results.map(row => {
                    return new Promise((resolve, reject) => {
                        configFileContent += `
[${row.queue_name}]
strategy=${row.strategy}
ringinuse=${row.ringinuse?'yes':'no'}
timeout=${row.timeout}
wrapuptime=${row.wrapuptime} \n
`;
                        const selectMemberQuery= `SELECT name from members where members.queue=?`
                        db.query(selectMemberQuery,[row.queue_name], (err, memberResults) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                if (memberResults.length > 0) {
                                    memberResults.forEach(memberRow => {
                                        configFileContent += `member=> PJSIP/${memberRow.name}\n`;
                                    });
                                }
                                resolve();
                            }
                        });
                    });
                });

                Promise.all(queuePromises)
                    .then(() => {
                        fs.writeFile(process.env.CONFIG_FILE_OUTPUT_LOCATION, configFileContent, (err) => {
                            if (err) {
                                reject(new Error(err));
                            } else {
                                ami.dialplanReload()
                                    .then(
                                        ()=>resolve('queue.conf file created and dialplan reloaded successfully')

                                    )
                                    .catch(err=> reject(new Error("failed to reload dialplan")));
                            }
                        });
                    })
                    .catch(error => {
                        reject(new Error(`ERROR:::::::${error}`));
                    });
            }
        });
    });
};

exports.createNewQueue = createNewQueue
exports.deleteQueue=deleteQueue
exports.updateQueue=updateQueue
exports.createConfigFile=createConfigFile