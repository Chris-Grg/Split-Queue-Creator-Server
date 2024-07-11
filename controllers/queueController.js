// controllers/queueController.js
const fs = require('fs');
const db = require('../db/connection');
const ami = require('./amiController')

const createNewQueue = async (queue) => {
    return new Promise((resolve, reject) => {
        const selectQuery = 'SELECT queue_name FROM queues WHERE queue_name = ?'
        db.query(selectQuery, [queue.queue_name], async (err, res) => {
            if (err) {
                reject(err)
            }
            else if (res.length > 0) {
                // console.log(`Queue ${queue.queue_name} already exists.`)
                resolve(`Queue ${queue.queue_name} already exists.`)
            } else {
                const insertQuery = 'INSERT INTO queues (queue_name, strategy, ringinuse, timeout, wrapuptime) VALUES (?, ?, ?, ?, ?)';
                db.query(insertQuery, [queue.queue_name, queue.strategy, queue.ringinuse, queue.timeout, queue.wrapuptime], (err, result) => {
                    if (err) reject(err)
                    else {
                        console.log(`New queue added successfully with ID: ${result.insertId}`)
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
if(err) reject(err)
else if (res.length===0){
resolve(`Queue ${queue_name} doesn't exist`)
}
else{
        const deleteQuery = `DELETE FROM queues WHERE queue_name= ?`
       db.query(deleteQuery,[queue_name], (err, result) => {
            if (err) reject(err)
            else {
                createConfigFile()
                resolve(`${queue_name} queue removed successfully`)
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
            if (err) reject(err)
            else if (res.length === 0) {
                resolve(`Queue ${queue.queue_name} doesn't exist.`)
            }
            db.query(selectQuery,[newname], async (err, res) => {
                if (err) reject(err)
                else if (res.length > 0) {
                    resolve(`Queue name ${newname} already exists`)
                }
                else {
                    const updateQuery = `UPDATE queues SET queue_name=?, strategy=?,ringinuse=?,timeout=?, wrapuptime=? WHERE queue_name=?`;
                    db.query(updateQuery,[newname,queue.strategy,queue.ringinuse,queue.timeout,queue.wrapuptime,queue.queue_name], (err, result) => {
                        if (err) reject(err)
                        else {
                            createConfigFile()
                            resolve(`Queue updated successfully`)
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
                reject(`ERROR:::::::${err}`);
            } else {
                let configFileContent = '';

                const queuePromises = results.map(row => {
                    return new Promise((queueResolve, queueReject) => {
                        configFileContent += `
[${row.queue_name}]
strategy=${row.strategy}
ringinuse=${row.ringinuse}
timeout=${row.timeout}
wrapuptime=${row.wrapuptime} \n
`;
                        const selectMemberQuery= `SELECT name from members where members.queue=?`
                        db.query(selectMemberQuery,[row.queue_name], (err, memberResults) => {
                            if (err) {
                                queueReject(err);
                            } else {
                                if (memberResults.length > 0) {
                                    memberResults.forEach(memberRow => {
                                        configFileContent += `member=> PJSIP/${memberRow.name}\n`;
                                    });
                                }
                                queueResolve();
                            }
                        });
                    });
                });

                Promise.all(queuePromises)
                    .then(() => {
                        fs.writeFile(process.env.CONFIG_FILE_OUTPUT_LOCATION, configFileContent, (err) => {
                            if (err) {
                                console.error('Error writing to queue.conf:', err);
                                reject(err);
                            } else {
                                ami.dialplanReload();  // reload the dialplan after creating the queue.conf file to apply the changes.
                                resolve('queue.conf file created and dialplan reloaded successfully');
                            }
                        });
                    })
                    .catch(error => {
                        reject(`ERROR:::::::${error}`);
                    });
            }
        });
    });
};

exports.createNewQueue = createNewQueue
exports.deleteQueue=deleteQueue
exports.updateQueue=updateQueue
exports.createConfigFile=createConfigFile