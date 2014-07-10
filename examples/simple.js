var tls = require('tls');
var ircb = require('../');

var irc = ircb({
  username: 'ircbexample',
  realName: 'ircbexample',
  nick: 'ircbexample',
  channels: ['#nodebombrange']
}, function () {
  irc.on('names', function (channel, names) {
    console.log(channel + ': ' + names.join(', '));
  });

  irc.on('message', function (from, to, msg) {
    console.log(from, '->', to + ': ' + msg)
  })
});

irc.pipe(tls.connect({
  host: 'chat.freenode.net',
  port: 6697
})).pipe(irc);
