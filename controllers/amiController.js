var ami = new require('asterisk-manager')(
    process.env.ASTERISK_PORT,
    process.env.ASTERISK_IP,
    process.env.ASTERISK_LOGIN,
    process.env.ASTERISK_PASSWORD,
     true);
ami.keepConnected();

const dialplanReload=async()=>{
    return new Promise((resolve, reject) => {
      ami.action({
        action: "Command",
        command: "dialplan reload"
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