  
const moment = require('moment');

function formatMessage(username, text, link) {
  if (link == undefined || link == null) link = '';
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    link
  };
}

module.exports = formatMessage;