var assert = require('assert'),
    parse = require('../lib/irc2/command-parser');

assert.deepEqual(parse(':lindbohm.freenode.net NOTICE * :*** Found your hostname\r\n'), {
  prefix: 'lindbohm.freenode.net',
  command: 'NOTICE',
  middle: ['*'],
  trailing: '*** Found your hostname'
});

assert.deepEqual(parse('PING :pratchett.freenode.net\r\n'), {
  prefix: null,
  command: 'PING',
  middle: [],
  trailing: 'pratchett.freenode.net'
});

assert.deepEqual(parse(':barjavel.freenode.net 372 mmalecki__ :- the network!\r\n'), {
  prefix: 'barjavel.freenode.net',
  command: '372',
  middle: ['mmalecki__'],
  trailing: '- the network!'
});

assert.deepEqual(parse(':source 372 many middle :- the network!\r\n'), {
  prefix: 'source',
  command: '372',
  middle: ['many', 'middle'],
  trailing: '- the network!'
});

assert.deepEqual(parse(':source 372 many middle\r\n'), {
  prefix: 'source',
  command: '372',
  middle: ['many', 'middle'],
  trailing: null
});

assert.deepEqual(parse(':source 372 many middle :with trailing\r\n'), {
  prefix: 'source',
  command: '372',
  middle: ['many', 'middle'],
  trailing: 'with trailing'
});
