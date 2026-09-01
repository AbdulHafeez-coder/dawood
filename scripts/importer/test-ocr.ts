import Tesseract from "tesseract.js";

async function run() {
  console.log("Reading image 1.jpg...");
  try {
    const { data: { text } } = await Tesseract.recognize(
      'https://www.mahamenterprises.com/images/omega/1.jpg',
      'eng',
      { logger: m => console.log(m) }
    );
    console.log("Extracted text from 1.jpg:");
    console.log(text);
  } catch(e) {
    console.error(e);
  }
}

run();
