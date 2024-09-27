// import * as ethers from "ethers";

// const hexString = process.argv[2];

// const burningPsbtDecode = ethers.utils.defaultAbiCoder.decode(
//   ["string"]
//   "0x" + hexString
// );

// console.log(burningPsbtDecode);

// const base64Decode = Buffer.from(burningPsbtDecode[0], "base64").toString();
// console.log(base64Decode);

// **** CAUTIONS: old ethers version ****

import * as bitcoinjs from "bitcoinjs-lib";

const base64 =
  "cHNidP8BAFICAAAAARNU6QfnJntyv775U8KLnIZ57Dsm0X5unVrzpSzQYzNkAAAAAAD9////ASEpAAAAAAAAFgAUdxfm2kX4vcOn+zZHrGUCcgtfxUAAAAAAAAEBK/gqAAAAAAAAIlEgTlD38frT8iFnripOV9yKKRqw9ETYampEtU9U124t8cVBFMSDBiFEXGfRnb02UIy5/c8J8VTvwXrsgGb45x6Zgp30x50RJFEluiaDf7zQMNTw2pUyaMr3teXa1TgDaaTtoqFAYHBj3sjm+EXlAQLBzTh703uJc627T+k+gixx42BIDPriDCLp+283xoThrY0D067QOw+C15XJuMJs3aDLsosXXWIVwVCSm3TBoElUt4tLYDXpel4HiloPKOyW1Ue/7prOgDrAGF6GJfXlWoOasKpiVCyQtxOuuPnIOZ2Z54Q5MrgEezXUswTL+A1n2fug3KZ7rWxsa4ev6uZ9jHsFkrwn6nmaqEUgxIMGIURcZ9GdvTZQjLn9zwnxVO/BeuyAZvjnHpmCnfStID1InQsqU3D+i48gEdx0ai96CPtaRsCjgPnB4fTBwmY+rMAAAA==";

const psbtFromBase64 = bitcoinjs.Psbt.fromBase64(base64);
const input = psbtFromBase64.txInputs[0].hash.reverse().toString("hex");

console.log(input);