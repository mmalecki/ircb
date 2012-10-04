var net = require('net'),
    tls = require('tls'),
    util = require('util'),
    events = require('events'),
    async = require('async'),
    commandParser = require('./irc2/parser/command-parser');
    replies = require('./irc2/parser/replies.json');

module.exports = function (options, cb) {
  return new IRC2(options, cb);
};

var IRC2 = function (options, cb) {
  var self = this;

  events.EventEmitter.call(self);

  self.host = options.host;
  self.secure = !!options.secure;
  self.port = options.port || (self.secure ? 6697 : 6667);
  self.nick = options.nick;

  self.motd = '';

  self._namesReplies = {};

  self.connection = (self.secure ? tls : net).connect({
    host: self.host,
    port: self.port,
    rejectUnauthorized: self.rejectUnauthorized
  }, function () {
    self.connection.on('data', function (chunk) {
      self._onData(chunk);
    });

    async.series([
      function (next) {
        return options.nick ? self.nick(options.nick, next) : next;
      },
      function (next) {
        return (options.username && options.realName)
          ? self.user(options.username, options.realName, next)
          : next();
      }
    ], function () {
      self.on('motd', function () {
        return options.channels ? self.join(options.channels, cb) : cb();
      });
    });
  }).on('error', function (err) {
    self.emit('error', err);
  });
};
util.inherits(IRC2, events.EventEmitter);

IRC2.prototype._onData = function (chunk) {
  chunk = chunk.toString('utf8');
  chunk.split('\r\n').filter(Boolean).forEach(this._parseMessage.bind(this));
};

IRC2.prototype._parseMessage = function (chunk) {
  this._processMessage(commandParser(chunk));
};

IRC2.prototype._processMessage = function (message) {
  var reply = replies[message.command],
      command = (reply && reply.name) || message.command,
      channel;

  switch (command) {
    case "001":
    case "NICK":
      this.nick = (command === "001") ? message.middle[0] : message.trailing;
      break;

    case "PING":
      this.write('PONG :' + message.trailing);
      break;

    // Handle MOTD
    case "RPL_MOTD":
      this.motd += message.trailing + '\n';
      break;

    case "RPL_ENDOFMOTD":
      this.emit('motd', this.motd);
      break;

    // Handle NAMES
    case "RPL_NAMREPLY":
      channel = message.middle[2];
      if (!this._namesReplies[channel]) {
        this._namesReplies[channel] = [];
      }
      Array.prototype.push.apply(this._namesReplies[channel], message.trailing.split(' '));
      break;

    case "RPL_ENDOFNAMES":
      channel = message.middle[1];
      if (this._namesReplies[channel]) {
        this.emit('names', channel, this._namesReplies[channel]);
        delete this._namesReplies[channel];
      }
      break;
  }
};

IRC2.prototype.nick = function (nick, cb) {
  this.write('NICK ' + nick, cb);
};

IRC2.prototype.user = function (username, realName, cb) {
  this.write('USER ' + username + ' 0 * :' + realName, cb);
};

IRC2.prototype.say = function (target, text, cb) {
  this.write('PRIVMSG ' + target + ' :' + text, cb);
};

IRC2.prototype.join = function (channels, cb) {
  channels = Array.isArray(channels) ? channels : [ channels ];
  this.write('JOIN ' + channels.join(','), cb);
};

IRC2.prototype.names = function (channel, cb) {
  var self = this;

  self.write('NAMES ' + channel, function (err) {
    if (err) {
      return cb(err);
    }

    self.on('names', function onNames(replyChannel, names) {
      if (replyChannel === channel) {
        cb(null, names);
        self.removeListener('names', onNames);
      }
    });
  });
};

IRC2.prototype.write = function (string, cb) {
  this.connection.write(string + '\r\n', cb);
};
