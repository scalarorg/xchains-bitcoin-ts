const convertBufferToHexString = (input: Uint8Array) => {
    return Array.prototype.map.call(input, x => ('00' + x.toString(16)).slice(-2)).join('');
}


// read input from command line: Eg: bun run index.ts [123, 234, 123, 234] => 7bea7bea

const input = process.argv[2];
const inputArray = JSON.parse(input);
const inputBuffer = new Uint8Array(inputArray);
const result = convertBufferToHexString(inputBuffer);


console.log(result);


// 0x16f4e69e71057f757e8d89318fb87da3fe5153133cfe050d019572e142c0d59c

// '[22, 244, 230, 158, 113, 5, 127, 117, 126, 141, 137, 49, 143, 184, 125, 163, 254, 81, 83, 19, 60, 254, 5, 13, 1, 149, 114, 225, 66, 192, 213, 156]'


// 16f4e69e71057f757e8d89318fb87da3fe5153133cfe050d019572e142c0d59c