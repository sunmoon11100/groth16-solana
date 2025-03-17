var ffjavascript = require('ffjavascript');
const {unstringifyBigInts, leInt2Buff} = ffjavascript.utils;
var fs = require("fs")
const process = require('process');

async function main() {
  let inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("inputPath not specified");
  }

  let outputPath = ""
  if (process.argv[3]) {
    outputPath += process.argv[3] +"/";
  }

  console.log = () => {};

  await fs.readFile(inputPath, async function(err, fd) {
    if (err) {
      return console.error(err);
    }
    console.log("File opened successfully!");
    const myData = JSON.parse(fd.toString());
    console.log(myData)

    for (const i in myData) {
      if (i === 'vk_alpha_1') {

        for (const j in myData[i]) {
          myData[i][j] = leInt2Buff(unstringifyBigInts(myData[i][j]), 32).reverse()
        }
      } else if (i === 'vk_beta_2') {
        for (const j in myData[i]) {
          console.log("myData[i][j] ", myData[i][j])

          let tmp = Array.from(leInt2Buff(unstringifyBigInts(myData[i][j][0]), 32)).concat(Array.from(leInt2Buff(unstringifyBigInts(myData[i][j][1]), 32))).reverse()
          console.log("tmp ", tmp);
          myData[i][j][0] = tmp.slice(0,32)
          myData[i][j][1] = tmp.slice(32,64)
        }
      } else if (i === 'vk_gamma_2') {
        for (const j in myData[i]) {
          let tmp = Array.from(leInt2Buff(unstringifyBigInts(myData[i][j][0]), 32)).concat(Array.from(leInt2Buff(unstringifyBigInts(myData[i][j][1]), 32))).reverse()
          console.log(`i ${i}, tmp ${tmp}`)
          myData[i][j][0] = tmp.slice(0,32)
          myData[i][j][1] = tmp.slice(32,64)
        }
      } else if (i === 'vk_delta_2') {
        for (const j in myData[i]) {
          let tmp = Array.from(leInt2Buff(unstringifyBigInts(myData[i][j][0]), 32)).concat(Array.from(leInt2Buff(unstringifyBigInts(myData[i][j][1]), 32))).reverse()
          myData[i][j][0] = tmp.slice(0,32)
          myData[i][j][1] = tmp.slice(32,64)
        }
      }
      else if (i === 'vk_alphabeta_12') {
        for (const j in myData[i]) {
          for (const z in myData[i][j]){
            for (const u in myData[i][j][z]){
              myData[i][j][z][u] = leInt2Buff(unstringifyBigInts(myData[i][j][z][u]))

            }
          }
        }
      }


      else if (i === 'IC') {
        for (const j in myData[i]) {
          for (const z in myData[i][j]){
            myData[i][j][z] = leInt2Buff(unstringifyBigInts(myData[i][j][z]), 32).reverse()

          }
        }
      }

    }


    let resFile = fs.openSync(outputPath + "verifying_key.rs", "w")
    let s = `use groth16_solana::groth16::Groth16VerifyingKey;\n\npub const VERIFYING_KEY: Groth16VerifyingKey =  Groth16VerifyingKey {\n\tnr_pub_inputs: ${myData.IC.length},\n\n`
    s += "\tvk_alpha_g1: [\n"
    for (let j = 0; j < myData.vk_alpha_1.length -1 ; j++) {
      console.log(typeof(myData.vk_alpha_1[j]))
      s += "\t\t" + Array.from(myData.vk_alpha_1[j])/*.reverse().toString()*/ + ",\n"
    }
    s += "\t],\n\n"
    fs.writeSync(resFile,s)
    s = "\tvk_beta_g2: [\n"
    for (let j = 0; j < myData.vk_beta_2.length -1 ; j++) {
      for (let z = 0; z < 2; z++) {
        s += "\t\t" + Array.from(myData.vk_beta_2[j][z])/*.reverse().toString()*/ + ",\n"
      }
    }
    s += "\t],\n\n"
    fs.writeSync(resFile,s)
    s = "\tvk_gamma_g2: [\n"
    for (let j = 0; j < myData.vk_gamma_2.length -1 ; j++) {
      for (let z = 0; z < 2; z++) {
        s += "\t\t" + Array.from(myData.vk_gamma_2[j][z])/*.reverse().toString()*/ + ",\n"
      }
    }
    s += "\t],\n\n"
    fs.writeSync(resFile,s)

    s = "\tvk_delta_g2: [\n"
    for (let j = 0; j < myData.vk_delta_2.length -1 ; j++) {
      for (let z = 0; z < 2; z++) {
        s += "\t\t" + Array.from(myData.vk_delta_2[j][z])/*.reverse().toString()*/ + ",\n"
      }
    }
    s += "\t],\n\n"
    fs.writeSync(resFile,s)
    s = "\tvk_ic: &[\n"
    let x = 0;

    for (var ic in myData.IC) {
      s += "\t\t[\n"
      // console.log(myData.IC[ic])
      for (var j = 0; j < myData.IC[ic].length - 1 ; j++) {
        s += "\t\t\t" + myData.IC[ic][j]/*.reverse().toString()*/ + ",\n"
      }
      x++;
      s += "\t\t],\n"
    }
    s += "\t]\n};"

    fs.writeSync(resFile,s)
  });
}


void main()
