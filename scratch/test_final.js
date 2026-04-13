const { GoogleGenerativeAI } = require('@google/generative-ai');
async function test() {
  const genAI = new GoogleGenerativeAI('AIzaSyBD-gcEDiMqs7UDPrX14Tif5kNUjE9qeOE');
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
  try {
    const result = await model.generateContent('Hi');
    console.log('SUCCESS:', result.response.text());
  } catch (error) {
    console.error('FAILURE:', error.message);
  }
}
test();
