var ircb = require('../');

var irc = ircb({
  host: 'irc.freenode.org',
  secure: true,
  username: 'mycoolbot',
  realName: 'mycoolbot',
  nick: 'mycoolbot',
  alternateNick: 'mycoolerbot',
  channels: ['#node.js']
}, function () {
  irc.on('names', function (channel, names) {
    console.log(channel + ': ' + names.join(', '));
  });
});
