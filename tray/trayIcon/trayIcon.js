/**
 * for documentation http://electron.rocks/proper-tray-icon/
 */
const platform = require('os').platform();

function createIcon(Tray) {
  let trayImage;
  // const imageFolder = './images';
  const imageFolder = __dirname + '/images';

  // Determine appropriate icon for platform
  if (platform === 'darwin') {
    trayImage = imageFolder + '/osx/iconTemplate.png';
  } else if (platform === 'win32') {
    trayImage = imageFolder + '/win/icon.ico';
  }

  return new Tray(trayImage);
}

exports.createIcon = createIcon