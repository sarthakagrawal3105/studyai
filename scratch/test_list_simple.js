const { GoogleGenerativeAI } = require('@google/generative-ai');
async function listModels() {
  const genAI = new GoogleGenerativeAI('AIzaSyBD-gcEDiMqs7UDPrX14Tif5kNUjE9qeOE');
  try {
    const list = await genAI.listModels();
    console.log('Available Models:');
    for (const model of list.models) {
      console.log(model.name);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
listModels();
