module.exports = Bitsy;

var copy = require('./copy');

function Bitsy(size){
	size || (size = 0);

	var octets = Math.ceil(size / 8)
	this.buffer = new Buffer(new Array(octets));
	this.length = size;
};

Bitsy.prototype.setSize = function(size){
	var octetCount = Math.ceil(size / 8);

	if(octetCount === 0){
		this.buffer = new Buffer(0);

	} else if(octetCount < this.buffer.length){
		var oldBuffer = this.buffer;
		this.buffer = new Buffer(new Array(octetCount));

		// Can't use plain buffer copy due to possible
		// left over bits set beyond bitsy.length but 
		// below buffer.length.
		copy(oldBuffer, this.buffer, 0, size - 1);

	} else if(octetCount > this.buffer.length){
		var oldBuffer = this.buffer;
		this.buffer = new Buffer(new Array(octetCount));

		oldBuffer.copy(buffer);
	}

	this.size = size;
};

Bitsy.prototype.get = function(index){
	if(index >= this.length || index < 0) return false;

	var octetIndex = Math.floor(index / 8);
	var mask = 1 << 7 -(index % 8);

	return !!(this.buffer[octetIndex] & mask);
};

Bitsy.copy = function(source, target, sourceFirstBitIndex, sourceLastBitIndex, targetFirstBitIndex){
	if(!(source instanceof Bitsy)) throw new TypeError('Source must be of type Bitsy!');
	if(!(target instanceof Bitsy)) throw new TypeError('Target must be of type Bitsy!');

	targetFirstBitIndex || (targetFirstBitIndex = 0);
	sourceFirstBitIndex || (sourceFirstBitIndex = 0);
	sourceLastBitIndex || (sourceLastBitIndex = source.length - 1);

	var sourceBuffer = source.getBuffer(),
		targetBuffer = target.getBuffer();

	copy(sourceBuffer, targetBuffer, sourceFirstBitIndex, sourceLastBitIndex, targetFirstBitIndex);	
}

Bitsy.prototype.set = function(index, bit){
	if(index >= this.length) throw new RangeError('Index ' + index + ' exceeds buffer size (' + this.length + ')!');

	var octetIndex = Math.floor(index / 8);
	var mask = 1 << 7 - (index % 8);
	var octet = this.buffer[octetIndex];

	this.buffer[octetIndex] = bit ? 
		octet | mask : 
		octet & ~mask;
};

Bitsy.prototype.toString = function(){
	return this.buffer.toString('hex');
};

Bitsy.prototype.getBuffer = function(){
	return this.buffer;
};

Bitsy.prototype.copyTo = function(target, targetFirstBitIndex, sourceFirstBitIndex, sourceLastBitIndex){
	Bitsy.copy(this, target, sourceFirstBitIndex, sourceLastBitIndex, targetFirstBitIndex);
};

Bitsy.prototype.copyFrom = function(source, sourceFirstBitIndex, sourceLastBitIndex, targetFirstBitIndex){
	Bitsy.copy(source, this, sourceFirstBitIndex, sourceLastBitIndex, targetFirstBitIndex);
}

Bitsy.prototype.slice = function(startIndex, endIndex){
	startIndex || (startIndex = 0);
	endIndex || (endIndex = this.length);
	
	if(startIndex < 0){
		startIndex += this.length;
	}

	if(endIndex < 0){
		endIndex += this.length;
	}
	//if(startIndex > endIndex) throw "Start index is greater than end index";
	
	var bitCount = endIndex - startIndex;

	var target = new Bitsy(bitCount);
	copy(this.buffer, target.getBuffer(), startIndex, endIndex - 1);

	return target;
};