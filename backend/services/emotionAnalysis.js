const { LanguageServiceClient } = require("@google-cloud/language");
const client = new LanguageServiceClient();

const analyzeEmotion = async (text) => {
  const document = {
    content: text,
    type: "PLAIN_TEXT",
  };

  const [result] = await client.analyzeSentiment({ document });
  const sentiment = result.documentSentiment;

  return {
    score: sentiment.score, // Sentiment score (-1 to 1)
    magnitude: sentiment.magnitude, // Intensity of emotion
  };
};

module.exports = { analyzeEmotion };
