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
```
irc.say('mmalecki', 'hello world');
```

### Getting list of people from a channel
```js
irc.names('#node.js', function (err, names) {
  if (err) throw err;
  console.log('There are ' + names.length + ' people in #node.js channel');
});
```
