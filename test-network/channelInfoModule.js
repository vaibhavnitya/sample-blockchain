const { exec } = require('child_process');

function updateChannelInfo () {
  exec('peer channel getinfo -c mychannel >> channelinfo.txt', (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    }
  });
}

const channelInfoModule = {
  updateChannelInfo
}

module.exports = channelInfoModule
