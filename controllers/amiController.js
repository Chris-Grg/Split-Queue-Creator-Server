var ami = new require('asterisk-manager')(
    process.env.ASTERISK_PORT,
    process.env.ASTERISK_IP,
    process.env.ASTERISK_LOGIN,
    process.env.ASTERISK_PASSWORD,
     true);
ami.keepConnected();
ami.on('connect', () => {
  console.log('Connected to Asterisk AMI');
});
ami.on('disconnect', () => {
  console.log('Disconnected from Asterisk AMI');
});
ami.on('reconnection', () => {
  console.log('Reconnecting to Asterisk AMI');
});
const dialplanReload=async()=>{
    return new Promise((resolve, reject) => {
      ami.action({
        action: "Command",
        command: "queue reload all"
      }, (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      });
    })

  }

  exports.dialplanReload = dialplanReload;