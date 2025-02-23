const { sendMessageToGemini } = require("../utils/apiHelpers");
const { db } = require('../config/firebase');

// Array of 30 manifestation quotes
const manifestationQuotes = [
  {
    quote: "I am worthy of my dreams and desires",
    theme: "self-worth"
  },
  {
    quote: "Everything I need comes to me at the perfect time",
    theme: "divine timing"
  },
  {
    quote: "I trust in the magic of new beginnings",
    theme: "fresh starts"
  },
  {
    quote: "I am aligned with the energy of infinite abundance",
    theme: "abundance"
  },
  {
    quote: "My potential to create and succeed is limitless",
    theme: "potential"
  },
  {
    quote: "I attract positive energy and experiences effortlessly",
    theme: "attraction"
  },
  {
    quote: "I am becoming the highest version of myself every day",
    theme: "growth"
  },
  {
    quote: "My dreams are transforming into reality before my eyes",
    theme: "manifestation"
  },
  {
    quote: "I welcome positive change with an open heart",
    theme: "transformation"
  },
  {
    quote: "I am in perfect harmony with the universe's plan",
    theme: "harmony"
  },
  {
    quote: "My inner light shines brightly for all to see",
    theme: "inner light"
  },
  {
    quote: "I choose confidence and self-love in every moment",
    theme: "self-love"
  },
  {
    quote: "Love and light surround me always",
    theme: "protection"
  },
  {
    quote: "Every day brings magical new opportunities",
    theme: "opportunities"
  },
  {
    quote: "I am the master creator of my reality",
    theme: "creation"
  },
  {
    quote: "My gratitude creates miracles in my life",
    theme: "gratitude"
  },
  {
    quote: "I release what no longer serves my highest good",
    theme: "release"
  },
  {
    quote: "My heart is open to receive all good things",
    theme: "receiving"
  },
  {
    quote: "I am divinely guided and protected",
    theme: "divine guidance"
  },
  {
    quote: "My success is inevitable",
    theme: "success"
  },
  {
    quote: "I attract abundance in all forms",
    theme: "prosperity"
  },
  {
    quote: "My dreams and reality are merging now",
    theme: "dream realization"
  },
  {
    quote: "I am aligned with my soul's purpose",
    theme: "purpose"
  },
  {
    quote: "The universe conspires in my favor",
    theme: "divine support"
  },
  {
    quote: "I am worthy of all the good life offers",
    theme: "worthiness"
  },
  {
    quote: "My positive thoughts create positive outcomes",
    theme: "positive thinking"
  },
  {
    quote: "I attract love and joy effortlessly",
    theme: "love attraction"
  },
  {
    quote: "My life is filled with infinite possibilities",
    theme: "possibilities"
  },
  {
    quote: "I trust in divine timing completely",
    theme: "faith"
  },
  {
    quote: "Every challenge brings a greater blessing",
    theme: "blessings"
  }
];

// Function to get quote based on day of month
const getDailyQuote = () => {
  const today = new Date();
  const dayOfMonth = today.getDate() - 1;
  return manifestationQuotes[dayOfMonth % manifestationQuotes.length];
};

const suggestActivities = async (uid, emotion = {}, userMessage = "") => {
  try {
    const prompt = `
      You are an emotionally intelligent AI companion. Based on the user's emotional state (${emotion.dominantEmotion || 'neutral'}) 
      and their message: "${userMessage}", provide personalized activity suggestions.
      
      Respond ONLY with a JSON object in this exact format, with no additional text or backticks:
      {
        "dailySuggestions": [
          {
            "title": "Brief activity title",
            "description": "Short description of the activity"
          }
        ],
        "mindfulnessActivities": [
          {
            "title": "Activity name",
            "description": "Brief overview",
            "duration": "Estimated time",
            "benefits": "Key benefits",
            "instructions": ["Step 1", "Step 2", "Step 3"],
            "guidance": "A gentle reminder or tip"
          }
        ],
        "journalingPrompt": "A thoughtful journaling prompt related to their current state"
      }
    `;

    const result = await sendMessageToGemini(prompt);
    const cleanResult = result.trim().replace(/^```json\s*|\s*```$/g, '');
    const suggestions = JSON.parse(cleanResult);
    const dailyQuote = getDailyQuote();

    return {
      dailySuggestions: suggestions.dailySuggestions,
      mindfulnessActivities: suggestions.mindfulnessActivities,
      journalingPrompt: suggestions.journalingPrompt,
      motivationalQuote: dailyQuote.quote,
      quoteTheme: dailyQuote.theme,
      quoteDate: new Date().toLocaleDateString()
    };

  } catch (error) {
    console.error("Error suggesting activities:", error);
    
    // Check if error is related to API quota
    if (error.message?.includes('RESOURCE_EXHAUSTED') || 
        error.message?.includes('quota') || 
        error.message?.includes('rate limit')) {
      throw {
        status: 429,
        message: 'Free messaging limit reached',
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      };
    }

    // For other errors, return default suggestions
    const dailyQuote = getDailyQuote();
    return {
      dailySuggestions: [
        {
          title: "Take a Mindful Break",
          description: "Practice deep breathing for a few minutes"
        },
        {
          title: "Connect with Nature",
          description: "Take a short walk outside"
        },
        {
          title: "Express Yourself",
          description: "Write down your thoughts and feelings"
        }
      ],
      mindfulnessActivities: [
        {
          title: "Simple Breathing Exercise",
          description: "A calming breathing technique",
          duration: "5 minutes",
          benefits: "Reduces stress and anxiety, improves focus",
          instructions: [
            "Find a comfortable seated position",
            "Close your eyes gently",
            "Breathe in slowly for 4 counts",
            "Hold for 4 counts",
            "Exhale slowly for 4 counts",
            "Repeat for 5 minutes"
          ],
          guidance: "If your mind wanders, gently bring your attention back to your breath"
        }
      ],
      journalingPrompt: "What's one small thing you're grateful for today?",
      motivationalQuote: dailyQuote.quote,
      quoteTheme: dailyQuote.theme,
      quoteDate: new Date().toLocaleDateString()
    };
  }
};

module.exports = { suggestActivities };
