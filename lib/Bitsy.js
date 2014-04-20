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
		var newSize = this.buffer.length;
		while(newSize > octetCount)	newSize /= 2;

		var oldBuffer = this.buffer;
		this.buffer = new Buffer(new Array(newSize));

		// Can't use plain buffer copy due to possible
		// left over bits set beyond bitsy.length but 
		// below buffer.length.
		copy(oldBuffer, this.buffer, 0, size - 1);

	} else if(octetCount > this.buffer.length){
		var newSize = this.buffer.length || 1;
		while(newSize < octetCount)	newSize *= 2;

		var oldBuffer = this.buffer;
		this.buffer = new Buffer(new Array(newSize));

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
	if(startIndex > endIndex) throw "Start index is greater than end index";
	
	// The block we'll start reading
	var sourceStartOctet = Math.floor((startIndex + 1) / 8);

	// The last block we'll need to read
	var sourceEndOctet = Math.floor((endIndex + 1) / 8);

	var octetCount = sourceEndOctet - sourceStartOctet;

	var sourceCurrentOctet = sourceStartOctet;
	var targetCurrentOctet = 0;

	// The shift we need to do with each octet to account for the
	// offset of the start
	var octetStartOffset = startIndex % 8;
	
	// The shift we need to do for the last octet to zero-out bits
	// exceeding the end index
	var octetEndOffset = 7 - (endIndex % 8);

	var targetBuffer = new Buffer(octetCount);
	var sourceBuffer = this.buffer;

	var sourceOctet, targetOctet;

	while(targetCurrentOctet <= octetCount){
		sourceOctet = sourceBuffer[sourceCurrentOctet++];
		targetOctet = sourceOctet << startOffset & 0xFF;
		
		if(sourceCurrentOctet === sourceEndOctet){
			targetOctet = targetOctet >>> (startOffset + endOffset) << (startOffset + endOffset);
		} else {
			sourceCurrentOctet++;
			sourceOctet = sourceBuffer[sourceCurrentOctet++];
			targetOctet |=  sourceOctet >>> (8 - startOffset);
		}

		targetBuffer[targetCurrentOctet++] = targetOctet;
	}

	return targetBuffer;
};