# Bitsy is a bitset made of real bits

You can create a bitset in many ways. I've seen some bold implementations use literal strings of 1s and 0s. I've also seen quite a few array based ones, either using booleans or numbers. Bitsy uses real bits backed by a byte buffer.

# Usage

First `npm install bitsy`

```javascript
var createBitsy = require('bitsy');

// Create a 10 MB bitset.
var MEGABYTE_IN_BITS = 1048576 * 8;
var bitsy = createBitsy(10 * MEGABYTE_IN_BITS);


// Set the 200th bit to true
bitsy.set(200, true);


// Set the 200th bit to false
bitsy.set(200, false);


// Copy part of a bitsy to another bitsy
var a = createBitsy(1000);
a.set(100, true);

var b = createBitsy(50);
// Copy the bit range 80-120 form a to b
a.copyTo(b, 80, 120);

// Since we set the 100th bit of a to true, then
// we copied a from index 80 to 120 to b (index 0 to 50),
// that bit should not be in index 20 in b, so the below
// statement will return true
b.get(20);
```