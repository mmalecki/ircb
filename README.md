# ircb
Name courtesy of [@isaacs](https://github.com/isaacs).

An IRC library which *I* like.

## Usage

### Creating a client
```js
var tls = require('tls');
var ircb = require('ircb');

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
```

### Joining a channel
```js
irc.join('#node.js');
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
  * `options.nick` (`string`, required) - IRC nick
  * `options.password` (`string`) - IRC password
  * `options.username` (`string`) - IRC username
  * `options.realName` (`string`) - IRC real name
  * `options.channels` (`array` of `string`, default: `[]`) - channels to join.
     If specified, calls `callback` after joining all the channels.
* `callback` (`function`) - called after identifying and joining all the
  channels specified

Returns a `Duplex` stream, which should be used like that:

```js
connection.pipe(ircb()).pipe(connection);
```

#### Events

`ircb` returns an event emitter which returns following events:

* `register` - called when instance is connected, identified and joined all the
  specified channels
* `error(err)` - called when an error occured
* `names(channel, names)` - called when a list of names for `channel` is received
