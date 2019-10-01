/**
 * given a string add a "." after the first character
 * @param str
 * @param charToInsert
 * @param position
 * @returns {string}
 */
function addDot(str, charToInsert = ".", position=0) {
  return str.slice(0, position) + charToInsert + str.slice(position)
}

function removeDot() {
  return ""
}

function insertUnreadIndicator(str, window) {
  // case where you should not insert an unread indicator

  if (window.isVisible()) return str;
  //if (newCount <= oldcount) return str;

  return addDot(str);
}

exports.addDot = addDot
exports.removeDot = removeDot
exports.insertUnreadIndicator = insertUnreadIndicator
