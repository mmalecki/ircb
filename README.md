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

`ircb` returns an event emitter which returns following events:

* `register` - called when instance is connected, identified and joined all the
  specified channels
* `error(err)` - called when an error occured
* `names(channel, names)` - called when a list of names for `channel` is received
