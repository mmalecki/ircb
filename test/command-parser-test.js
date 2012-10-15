var assert = require('assert'),
    parse = require('../lib/irc2/parser/command-parser');

assert.deepEqual(parse(':lindbohm.freenode.net NOTICE * :*** Found your hostname'), {
  prefix: 'lindbohm.freenode.net',
  command: 'NOTICE',
  middle: ['*'],
  trailing: '*** Found your hostname'
});

assert.deepEqual(parse('PING :pratchett.freenode.net'), {
  prefix: null,
  command: 'PING',
  middle: [],
  trailing: 'pratchett.freenode.net'
});

assert.deepEqual(parse(':barjavel.freenode.net 372 mmalecki__ :- the network!'), {
  prefix: 'barjavel.freenode.net',
  command: '372',
  middle: ['mmalecki__'],
  trailing: '- the network!'
});

assert.deepEqual(parse(':source 372 many middle :- the network!'), {
  prefix: 'source',
  command: '372',
  middle: ['many', 'middle'],
  trailing: '- the network!'
});

assert.deepEqual(parse(':source 372 many middle'), {
  prefix: 'source',
  command: '372',
  middle: ['many', 'middle'],
  trailing: null
});

assert.deepEqual(parse(':source 372 many middle :with trailing'), {
  prefix: 'source',
  command: '372',
  middle: ['many', 'middle'],
  trailing: 'with trailing'
});
