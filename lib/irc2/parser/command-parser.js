module.exports = function (chunk) {
  var prefix = null,
      buffer = '',
      middle = [],
      command,
      trailing = null,
      matching,
      i;

  if (chunk[0] === ':') {
    matching = 'prefix';
    i = 1;
  }
  else {
    matching = 'command';
    i = 0;
  }

  for (; i < chunk.length; i++) {
    if (chunk[i] === ' ') {
      if (matching === 'prefix') {
        matching = 'command';
        prefix = buffer;
      }
      else if (matching === 'command') {
        matching = 'middle';
        command = buffer;
      }
      else if (matching === 'middle') {
        middle.push(buffer);
      }
      buffer = '';
    }
    else if (chunk[i] === ':' && matching === 'middle') {
      trailing = chunk.substring(i + 1, chunk.length);
      break;
    }
    else {
      buffer += chunk[i];
    }
  }

  if (matching === 'middle' && buffer) {
    middle.push(buffer);
  }

  return {
    prefix: prefix,
    command: command,
    middle: middle,
    trailing: trailing
  };
};
