const { app, Menu, Tray, nativeImage, ipcMain, BrowserWindow, Notification } = require('electron')
const { assembleTitle } = require('./tray/trayTitle')
const shortcut = require('./shortcut/globalShortcut')
const { createIcon } = require('./tray/trayIcon/trayIcon')
const openAboutWindow = require('about-window').default;
const join = require('path').join;
const path = require('path')
const url = require('url')
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const axios = require('axios');
const { machineIdSync } = require('node-machine-id')

// auto update
//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

// function sendStatusToWindow(text) {
//   log.info(text);
//   win.webContents.send('message', text);
// }

// function createDefaultWindow() {
//   win = new BrowserWindow();
//   // win.webContents.openDevTools();
//   win.on('closed', () => {
//     win = null;
//   });
//   win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
//   return win;
// }

autoUpdater.on('checking-for-update', () => {
  console.log('checking-for-update' )
  // sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
  console.log('update-available' )
  // createDefaultWindow()
 // sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', (info) => {
  console.log('update-not-available' )
  //sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater.', err)
  //sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
  console.log('download-progress' )
  const MEGA_BYTE = 1000000;
  let log_message = 'Download speed: ' + (progressObj.bytesPerSecond/MEGA_BYTE).toFixed(2) + ' MB/sec';
  log_message = log_message + ' - Downloaded ' + Math.floor(progressObj.percent) + '%';
  log_message = log_message + ' (' + Math.floor(progressObj.transferred/MEGA_BYTE) + ' MB/' + Math.floor(progressObj.total/MEGA_BYTE) + ' MB)';
  //sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded' )
  //sendStatusToWindow('Update downloaded: Please restart Voice Notifies to apply update');
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let tray = null;
let mainWindow = null;

function createTray() {
  // Setup the menubar with an icon
  tray = createIcon(Tray)

  // Add a click handler so that when the user clicks on the menubar icon, it shows
  // our popup window
  tray.on('click', function (event) {
    toggleWindow()
  })

  // console.log(join(__dirname, '..') )
  // console.log(join(__dirname, '/assets/voiceNotifier.png') )

  const menu = Menu.buildFromTemplate([
    {
      label: 'Application',
      submenu: [
        {
          label: 'About This App',
          click: () => openAboutWindow({
            icon_path: join(__dirname, '/assets/voiceNotifier.png'),
            copyright: '',
            package_json_dir: join(__dirname, '..')
          })
        },
        { type: 'separator' },
        {
          label: 'Quit', accelerator: 'Command+Q', click: function () {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);

  mainWindow.setMenuBarVisibility(true);


  tray.setToolTip('Voice Notifies')

  mainWindow.on('blur', () => {
    mainWindow.hide()
    tray.setHighlightMode('never')
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
  // Create the browser window.
  // Make the popup window for the menubar
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    show: false,
    frame: false,
    minimizable: false,
    alwaysOnTop: true,
    backgroundThrottling: false,
    title: 'Voice Notifies',
    autoHideMenuBar: false,
    backgroundColor: '#EDEDED',
    icon: __dirname + './tray/images/osx/iconTemplate@2x.png',
  })

  mainWindow.setTitle('Voice Notifies');

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  createTray()

  let contents = mainWindow.webContents

  contents.on('did-finish-load', () => {
    ipcMain.on('unread-count-update', (event, unread) => {
      tray.setTitle(assembleTitle(unread, mainWindow))
    })

    ipcMain.on('shortcutSave', (event, shortcutKey) => {
      event.returnValue = shortcut.saveShortcut(shortcutKey, toggleWindow);
    })

    ipcMain.on('signOut', (event) => {
      mainWindow.webContents.session.clearCache(() => event.returnValue = true);
      mainWindow.webContents.session.clearStorageData(() => event.returnValue = true);
    })

    ipcMain.on('quitApp', () => app.quit())

  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows
    mainWindow = null
  })
}

function init() {
  createWindow();
  shortcut.saveShortcutForFirstTime();
  shortcut.registerShortcut(shortcut.getSavedShortcut(), toggleWindow)

  // createDefaultWindow();
  // This will immediately download an update, then install when the
  // app quits.
  //-------------------------------------------------------------------

    //scott d commented this
  //autoUpdater.checkForUpdates()


   // .then(response => console.log('response', response))
   //  .catch(err => console.log('err', err));
  //autoUpdater.checkForUpdatesAndNotify()
  //   .then(response => console.log('response', response))
  //   .catch(err => console.log('err', err))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', init)

// allow auto start on computer startup, might not work on mac app store builds
app.setLoginItemSettings({ openAtLogin: true })

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('browser-window-blur', () => {
  mainWindow.hide()
  tray.setHighlightMode('never')
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('browser-window-created', (e, window) => window.setMenu(null))

app.on('will-quit', () => shortcut.unregisterShortcut(shortcut.getSavedShortcut()))

// app.dock.hide() // hide electron on the dock
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
