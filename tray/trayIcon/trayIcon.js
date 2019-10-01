const platform = require('os').platform();

function createIcon(Tray) {
  let trayImage;
  const imageFolder = __dirname + '/images';

  if (platform === 'darwin') {
    trayImage = imageFolder + '/osx/iconTemplate.png';
  } else if (platform === 'win32') {
    trayImage = imageFolder + '/win/icon.ico';
  }

  return new Tray(trayImage);
}

exports.createIcon = createIcon