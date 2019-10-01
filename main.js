const { app, Tray, ipcMain, BrowserWindow } = require('electron')
const shortcut = require('./shortcut/globalShortcut')
const { createIcon } = require('./tray/trayIcon/trayIcon')
const path = require('path')
const url = require('url')


let tray = null;
let mainWindow = null;

function createTray() {
  tray = createIcon(Tray)
  tray.on('click', function (event) {
    toggleWindow()
  })
}

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
    tray.setHighlightMode('never')
  } else {
    tray.setHighlightMode('always')
    showWindow()
  }
}

const showWindow = () => {
  const trayPos = tray.getBounds()
  const windowPos = mainWindow.getBounds()
  let x, y = 0
  if (process.platform === 'darwin') {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height)
  } else {
    x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2))
    y = Math.round(trayPos.y + trayPos.height * 10)
  }

  mainWindow.setPosition(x, y, false)
  mainWindow.show()
  mainWindow.focus()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 500,
    show: false,
    frame: false,
    minimizable: false,
    alwaysOnTop: true,
    backgroundThrottling: false,
    title: 'Electron Google Voice',
    autoHideMenuBar: false,
    backgroundColor: '#EDEDED',
    icon: __dirname + './tray/images/osx/iconTemplate@2x.png',
    webPreferences: {
        webviewTag: true
    }
  })

  mainWindow.setTitle('Electron Google Voice');

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  createTray()

  let contents = mainWindow.webContents
  contents.on('did-finish-load', () => ipcMain.on('quitApp', () => app.quit()));
  mainWindow.on('closed', function () { mainWindow = null })
}

function init() {
  createWindow();
  shortcut.saveShortcutForFirstTime();
  shortcut.registerShortcut(shortcut.getSavedShortcut(), toggleWindow)
}

app.on('ready', init)

app.setLoginItemSettings({ openAtLogin: true })

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('browser-window-blur', () => {
  mainWindow.hide()
  tray.setHighlightMode('never')
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('browser-window-created', (e, window) => window.setMenu(null))
app.on('will-quit', () => shortcut.unregisterShortcut(shortcut.getSavedShortcut()))

