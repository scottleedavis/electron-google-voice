const { globalShortcut } = require('electron')
const settings = require('electron-settings');

module.exports = {
  registerShortcut: (savedShortcut, toggleWindow) => {
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
    globalShortcut.unregister(savedShortcutKey)
    globalShortcut.unregisterAll()
  },

  getSavedShortcut: () => {
    return settings.get('openAppShortcut.shortcutKey');
  },

  saveShortcut: function (shortcutToSave, toggleWindow) {
    settings.set('openAppShortcut', { shortcutKey: shortcutToSave, });
    this.unregisterShortcut(this.getSavedShortcut());
    return this.registerShortcut(shortcutToSave, toggleWindow);
  },

  saveShortcutForFirstTime: () => {
    const defaultShortcutKey = 'Command+u';

    if (!settings.get('openAppShortcut.shortcutKey')) {
      settings.set('openAppShortcut', {
        shortcutKey: defaultShortcutKey,
      });
    }
  }
}