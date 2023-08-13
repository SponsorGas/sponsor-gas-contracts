const fs = require('fs');
import { Blob, File, Web3Storage } from "web3.storage";

async function main() {
  const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_KEY! })
  const nftImageFile = getLocalImageAsFile(__dirname+"/image/xSuperhackNFT.png")
  const nftImageCID = await client.put([nftImageFile]);
  console.log(`nftImageCID : ${nftImageCID}`)
  // Convert form data to a JSON object
  const metadata = {
    "description": "Superhack the Superchain.Today, over 1000 developers embark on a week long journey to build what's fun, novel, experimental, or just plain needed for the Superchain. ETHGlobal is thrilled with the support of Optimism, Base, Zora, & Worldcoin to support some of the first Superchain builders.",
    "image": nftImageCID,
    "name": "xSuperhack"
  }
  const metadataFile = makeFileObjects(JSON.stringify(metadata))
  const metadataCID = await client.put(metadataFile);
  console.log(`Metadata File : ${metadataCID}`)
	
}



function makeFileObjects (formData:string) {
    const blob = new Blob([formData], { type: 'application/json' })
    const files = [
      new File([blob], 'metadata.json')
    ]
    return files
  }

function getLocalImageAsFile(filePath:string) {
  // Read the local image file as a Buffer
  const fileData = fs.readFileSync(filePath);

  // Get the MIME type of the image (replace 'image/png' with the appropriate MIME type)
  const mimeType = 'image/png';

  // Create a new Blob object with the file data and MIME type
  const blob = new Blob([fileData], { type: mimeType });

  // Create a new File object and provide a name for the file (e.g., 'image.png')
  const fileName = 'image.png';
  const file = new File([blob], fileName, { type: mimeType });

  return file;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
