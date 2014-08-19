# ircb
Name courtesy of [@isaacs](https://github.com/isaacs).

An IRC library which *I* like.

## Usage

### Creating a client
```js
var ircb = require('ircb');

var irc = ircb({
  host: 'irc.freenode.org',
  secure: true,
  nick: 'mycoolbot',
  username: 'mycoolbot',
  realName: 'mycoolbot',
  channels: ['#node.js'] // optional
}, function () {
  console.log('Connected');
  console.log('MOTD:\n');
  console.log(irc.motd);
});
```

### Joining a channel
```js
irc.join('#node.js', function (err) {
  if (err) throw err;
  console.log('Joined #node.js');
});
```

### Saying stuff

#### To a channel
```js
irc.say('#node.js', 'hello world');
```

#### To a person
```js
irc.say('mmalecki', 'hello world');
```

### Getting list of people from a channel
```js
irc.names('#node.js', function (err, names) {
  if (err) throw err;
  console.log('There are ' + names.length + ' people in #node.js channel');
});
```

## API

### ircb(options, callback)

* `options` (`Object`)
  * `options.host` (`string`) - host to connect to
  * `options.port` (`number`, default: `options.secure ? 6697 : 6667`) - port to connect to
  * `options.secure` (`boolean`, default: `false`) - use TLS?
  * `options.rejectUnauthorized` (`boolean`, default: `false`) - reject unauthorized certificates when using TLS
  * `options.nick` (`string`, required) - IRC nick
  * `options.password` (`string`) - IRC password
  * `options.username` (`string`) - IRC username
  * `options.realName` (`string`) - IRC real name
  * `options.channels` (`array` of `string`, default: `[]`) - channels to join.
     If specified, calls `callback` after joining all the channels.
* `callback` (`function`) - called after connecting to IRC, identifying and
  joining all the channels specified

#### Events

`ircb` returns an event emitter which emits the following events:

* `register` - emitted when instance is connected, identified and joined all the
  specified channels
* `message(from, to, message)` - emitted when a message is received
* `names(channel, names)` - emitted when a list of names for `channel` is received
* `join(prefix, channel)` - emitted when someone joins a channel. `prefix` is of the format `<nick>!<id>@<host>`
* `part(prefix, channel, message)` - emitted when someone leaves a channel
* `kick(prefix, channel, user, reason)` - emitted when someone is kicked from a channel. `prefix` (see above) kicked `user` for a `reason` (defaults to `user` if no reason was given)
* `motd(text)` - emitted when the message of the day is received
* `error(err)` - emitted when an error occurred
* `close(had_error)` - emitted when the socket is fully closed, see [net.Socket](http://nodejs.org/docs/latest/api/all.html#all_event_close_2)
