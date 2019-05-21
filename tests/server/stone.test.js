////////////////////////////////////////////////////////////////////////////////
//                            Pirate Ship Battles                             //
//                                                                            //
//                          Tests - Server - Island                           //
////////////////////////////////////////////////////////////////////////////////

const Stone = require('../../server/stone.js');
const Player = require('../../server/player.js');

////////////////////////////////////////////////////////////////////////////////
test('server/island: class Island - constructor', () => {
  let p = new Stone(1, 1, 10, 10);

  expect(new Stone(1, 1, 10, 10)).toBeInstanceOf(Stone);
  expect(p.x).toBe(1);
  expect(p.y).toBe(1);

  expect(new Stone(-1, -1, 10, 10)).toThrow;
});
