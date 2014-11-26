var util = require('util'),
    Duplex = require('stream').Duplex,
    async = require('async'),
    commandParser = require('./ircb/parser/command-parser'),
    replies = require('./ircb/parser/replies.json');

module.exports = function (options, cb) {
  return new IRCb(options, cb);
};

var IRCb = function (options, cb) {
  var self = this;

  Duplex.call(self);

  if (typeof cb == 'function') {
    self.on('register', cb);
  }

  self.host = options.host;
  self.rejectUnauthorized = !!options.rejectUnauthorized;
  self.nick = options.nick;
  self.password = options.password;

  self.channels = [];

  self.motd = '';

  self._namesReplies = {};

  async.series([
    function (next) {
      return options.password
        ? self.pass(options.password, next)
        : next();
    },
    function (next) {
      return options.nick
        ? self.nick_(options.nick, next)
        : next();
    },
    function (next) {
      return (options.username && options.realName)
        ? self.user(options.username, options.realName, next)
        : next();
    },
    function (next) {
      self.on('motd', function () {
        return options.channels
          ? self.join(options.channels, next)
          : next();
      });
    }
  ], function () {
    self.emit('register');
  });
};
util.inherits(IRCb, Duplex);

IRCb.prototype._write = function (chunk, encoding, callback) {
  chunk = chunk.toString('utf-8');
  chunk.split('\r\n').filter(Boolean).forEach(this._parseMessage.bind(this));
  callback();
};

IRCb.prototype._parseMessage = function (chunk) {
  this._processMessage(commandParser(chunk));
};

IRCb.prototype._processMessage = function (message) {
  var reply = replies[message.command],
      command = (reply && reply.name) || message.command,
      channel;

  switch (command) {
    case "001":
    case "NICK":
      this.nick = (command === "001") ? message.middle[0] : message.trailing;
      break;

    case "PING":
      this._writeLine('PONG :' + message.trailing);
      break;

    case "JOIN":
      channel = message.middle[0];
      if (!channel) channel = message.trailing;
      this.emit('join', message.prefix, channel);
      if (message.prefix.split('!')[0] === this.nick && this.channels.indexOf(channel) === -1) {
        this.channels.push(channel);
      }
      break;

    case "PART":
      channel = message.middle[0];
      this.emit('part', message.prefix, channel, message.trailing);
      if (message.prefix.split('!')[0] === this.nick && this.channels.indexOf(channel) !== -1) {
        this.channels.splice(this.channels.indexOf(channel), 1);
      }
      break;

    case "KICK":
      channel = message.middle[0];
      this.emit('kick', message.prefix, channel, message.middle[1], message.trailing);
      if (message.prefix.split('!')[0] === this.nick && this.channels.indexOf(channel) !== -1) {
        this.channels.splice(this.channels.indexOf(channel), 1);
      }
      break;

    // Handle MOTD
    case "RPL_MOTD":
      this.motd += message.trailing + '\n';
      break;

    case "RPL_ENDOFMOTD":
      this.emit('motd', this.motd);
      break;

    case "ERR_NOMOTD":
      this.emit('motd', null);
      break;

    case "PRIVMSG":
      var from = message.prefix.substr(0, message.prefix.indexOf('!'));
      this.emit('message', from, message.middle[0], message.trailing);
      break;

    // Handle NAMES
    case "RPL_NAMREPLY":
      channel = message.middle[2];
      if (!this._namesReplies[channel]) {
        this._namesReplies[channel] = [];
      }
      Array.prototype.push.apply(this._namesReplies[channel], message.trailing.split(' ').filter(Boolean));
      break;

    case "RPL_ENDOFNAMES":
      channel = message.middle[1];
      if (this._namesReplies[channel]) {
        this.emit('names', channel, this._namesReplies[channel]);
        delete this._namesReplies[channel];
      }
      break;

    case "RPL_WHOISUSER":
      var whois = {
        nick: message.middle[1],
        username: message.middle[2],
        hostname: message.middle[3],
        realName: message.trailing
      };

      this.emit('whois', null, whois);
      break;

    case "ERR_NOSUCHNICK":
      this.emit('whois', new Error(message.trailing));
      break;
  }
};

IRCb.prototype.pass = function (pass, cb) {
  this._writeLine('PASS ' + pass, cb);
};

IRCb.prototype.nick_ = function (nick, cb) {
  this._writeLine('NICK ' + nick, cb);
};

IRCb.prototype.user = function (username, realName, cb) {
  this._writeLine('USER ' + username + ' 0 * :' + realName, cb);
};

IRCb.prototype.say = function (target, text, cb) {
  this._writeLine('PRIVMSG ' + target + ' :' + text, cb);
};

IRCb.prototype.join = function (channels, cb) {
  channels = Array.isArray(channels) ? channels : [ channels ];
  this._writeLine('JOIN ' + channels.join(','), cb);
};

IRCb.prototype.part = function (channels, message, cb) {
  if (typeof message === 'function') {
    cb = message;
    message = '';
  }
  channels = Array.isArray(channels) ? channels : [ channels ];
  this._writeLine('PART ' + channels.join(',') + ' :' + message, cb);
};

IRCb.prototype.kick = function (channel, nick, message, cb) {
  if (typeof message === 'function') {
    cb = message;
    message = null;
  }
  if (message === null || typeof message === 'undefined') {
    message = nick;
  }
  this._writeLine('KICK ' + channel + ' ' + nick + ' :' + message, cb);
};


IRCb.prototype.names = function (channel, cb) {
  var self = this;

  self._writeLine('NAMES ' + channel, function (err) {
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

IRCb.prototype.whois = function (nick, cb) {
  var self = this;

  self.write('WHOIS ' + nick, function (err) {
    if (err) {
      return cb(err);
    }

    self.on('whois', function onWhois (err, whois) {
      if (err) {
        return cb(err);
      }

      if (nick === whois.nick) {
        cb(null, whois);
        self.removeListener('whois', onWhois);
      }
    });
  });
};

IRCb.prototype.quit = function (msg, cb) {
  this._writeLine('QUIT :' + (msg || 'Goodbye.'), cb);
};

IRCb.prototype._writeLine = function (string, cb) {
  this.push(string + '\r\n');
  cb && cb();
}

IRCb.prototype._read = function () {};
