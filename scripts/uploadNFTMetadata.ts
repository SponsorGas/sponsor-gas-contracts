const fs = require('fs');
import { Blob, File, Web3Storage } from "web3.storage";

async function main() {
  const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_KEY! })
  const nftImageFile = getLocalImageAsFile(__dirname+"/image/NAVHHackerNFT.png")
  const nftImageCID = await client.put([nftImageFile]);
  console.log(`nftImageCID : ${nftImageCID}`)
  // Convert form data to a JSON object
  const metadata = {
    "description": "NAVH celebrates web3 developers, NFT artists, students, community builders, product specialists, and futurists, among others, empowering them to make a meaningful impact through innovation, blockchain, and collaboration. Whether you're a developer, a designer, an entrepreneur, or a visionary with an idea that's ready to shake things up, this hackathon is for you.",
    "image": nftImageCID,
    "name": "NAVHHackerNFT"
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
