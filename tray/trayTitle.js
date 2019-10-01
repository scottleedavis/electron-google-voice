// const {insertUnreadIndicator} = require('./unreadIndicator')

function assembleTitle(unread, window) {
  const messages = unread.messages ? ` M${unread.messages}` : ""
  const calls = unread.calls ? ` C${unread.calls}`: ""
  const voicemail = unread.voicemail ? ` V${unread.voicemail}`: ""

  return `${messages}${calls}${voicemail}`
}

exports.assembleTitle = assembleTitle