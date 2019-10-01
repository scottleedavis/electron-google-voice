const { ipcRenderer } = require('electron');

ipcRenderer.on('request', function () {
  ipcRenderer.sendToHost(getValues());
});

function getValues() {
  const messages = document.querySelector('[gv-aria-label*="Messages"]')
    .getAttribute('gv-aria-label')
  const calls = document.querySelector('[gv-aria-label*="Calls"]')
    .getAttribute('gv-aria-label')
  const voicemail = document.querySelector('[gv-aria-label*="Voicemail"]')
    .getAttribute('gv-aria-label')

  return {
    messages: sanitize(messages),
    calls: sanitize(calls),
    voicemail: sanitize(voicemail),
  }
}

function sanitize(unsanitizedValue){
  return unsanitizedValue.replace(/\D/g,'');
}