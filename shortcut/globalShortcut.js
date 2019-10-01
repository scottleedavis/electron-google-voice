const { globalShortcut } = require('electron')
const settings = require('electron-settings');

module.exports = {
  registerShortcut: (savedShortcut, toggleWindow) => {
    // Register a 'CommandOrControl+X' shortcut listener.
    const ret = globalShortcut.register(savedShortcut, () => {
      toggleWindow();
    })

    if (!ret) {
      console.log('registration failed')
      return false;
    }else {
      console.log('registration succeeded')
      return true;
    }
  },

  unregisterShortcut: savedShortcutKey => {
    // Unregister a shortcut.
    globalShortcut.unregister(savedShortcutKey)

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
  },

  getSavedShortcut: () => {
    return settings.get('openAppShortcut.shortcutKey');
  },

  saveShortcut: function (shortcutToSave, toggleWindow) {
    settings.set('openAppShortcut', { shortcutKey: shortcutToSave, });
    this.unregisterShortcut(this.getSavedShortcut()) // uregister old shortcut
    return this.registerShortcut(shortcutToSave, toggleWindow) // register new shortcut
  },

  saveShortcutForFirstTime: () => {
    // if no shortcut has been saved, save default shortcut key
    const defaultShortcutKey = 'Command+u';

    if (!settings.get('openAppShortcut.shortcutKey')) {
      console.log('no setting found',)
      settings.set('openAppShortcut', {
        shortcutKey: defaultShortcutKey,
      });
    }
  }
}