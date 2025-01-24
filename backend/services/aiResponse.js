const { sendMessageToGemini } = require("../utils/apiHelpers");

const generateResponse = async (userMessage, emotion) => {
  let prompt = "";

  if (emotion.score > 0.5) {
    prompt = `The user seems happy. Respond positively: ${userMessage}`;
  } else if (emotion.score < -0.5) {
    prompt = `The user seems upset. Respond empathetically: ${userMessage}`;
  } else {
    prompt = `The user seems neutral. Respond neutrally: ${userMessage}`;
  }

  const aiResponse = await sendMessageToGemini(prompt);
  return aiResponse;
};

module.exports = { generateResponse };
