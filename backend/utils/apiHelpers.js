// Define your API key handling and Google Generative AI integration
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

/**
 * Send a message to Google's Gemini API with enforced brevity
 * @param {string} prompt - The user's message/prompt
 * @param {boolean} expectJson - Whether to expect and return JSON (default: false)
 * @returns {Promise<string|object>} The response from Gemini, as a string or parsed JSON if expectJson is true
 */
const sendMessageToGemini = async (prompt, expectJson = false) => {
  try {
    // Adjust the prompt based on whether JSON is expected
    let brevityPrompt = `
CRITICAL INSTRUCTION: You must respond in a complete, valid JSON object (if JSON is requested) or 1-2 sentences maximum (30 words or less total if text is requested).
Write as if texting a close friend - casual, brief, warm if text.
No formal language, no explanations, no lists.
`;

    if (expectJson) {
      brevityPrompt += `
If JSON is requested, respond ONLY with a valid, complete JSON object in this exact format, with no additional text or backticks:
{
  "dailySuggestions": [
    {
      "title": "Brief activity title",
      "description": "Short, friendly description of the activity, like you’re chatting"
    }
  ],
  "mindfulnessActivities": [
    {
      "title": "Activity name",
      "description": "Brief overview, conversational and warm",
      "duration": "Estimated time, short and simple",
      "benefits": "Key benefits, in a friend’s tone",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "guidance": "A gentle, friendly tip or encouragement"
    }
  ],
  "journalingPrompt": "A thoughtful, friend-like journaling prompt related to their current state"
}
Ensure the JSON is fully formed, with all required fields, no truncation, and double-quoted keys (e.g., "title", not 'title'). Use proper double quotes for all strings, and ensure apostrophes (e.g., "don't", "you're") are correctly formatted as ' (apostrophe), not " (straight quote).
`;
    }

    brevityPrompt += `
${prompt}

REMEMBER: If JSON is requested, return a complete, valid JSON object with double-quoted keys and proper apostrophes (e.g., "don't", not "don"t"). If text, keep it to 1-2 sentences, conversational, and brief like a text message.
`;

    // Updated model and strict configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // Or "gemini-2.0-flash-lite" if using a different model
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500, // Ensure full JSON object can fit
        topP: 0.8,
        topK: 40
      }
    });
    
    // Generate content
    const result = await model.generateContent(brevityPrompt);
    const response = await result.response;
    let text = response.text().trim();

    // Handle JSON response if requested
    if (expectJson) {
      // Try to parse as JSON, with fallback and cleanup for incomplete JSON
      try {
        // Remove any backticks or code block markers
        text = text.replace(/^```json\s*|\s*```$/g, '').trim().replace(/^json\s*/i, '');
        
        // Ensure double quotes for JSON compliance and fix apostrophes
        text = text.replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/(\w+)s(\w+)/g, '$1\'s$2') // Fix apostrophes (e.g., "What"s" -> "What's")
          .replace(/(\w+)’s(\w+)/g, '$1\'s$2') // Handle smart quotes if present
          .replace(/"(\w+)t worry"/g, "'$1n't worry'") // Fix "don"t" -> "don't"
          .replace(/"(\w+)t"/g, "'$1n't'"); // Fix other contractions (e.g., "can"t" -> "can't")

        if (!text.endsWith('}')) {
          text += '}'; // Attempt to close the JSON object
          console.log("Attempted to repair incomplete JSON:", text);
        }

        const jsonResponse = JSON.parse(text);
        return jsonResponse; // Return the parsed JSON object
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response in sendMessageToGemini:", parseError, "Raw response:", text);
        // Fallback to default JSON structure with double quotes and proper apostrophes
        return {
          "dailySuggestions": [
            {
              "title": "Take a Mindful Break",
              "description": "Chill with some deep breathing—it’s super relaxing!"
            }
          ],
          "mindfulnessActivities": [
            {
              "title": "Easy Breathing",
              "description": "A quick way to calm down and feel grounded",
              "duration": "5 minutes",
              "benefits": "Takes the edge off, helps you feel lighter",
              "instructions": ["Sit comfy somewhere quiet", "Close your eyes if you want", "Breathe in slow for 4 counts, hold, then breathe out slow"],
              "guidance": "Don’t stress if your mind wanders—just ease back to your breath, buddy!"
            }
          ],
          "journalingPrompt": "Hey, what’s one little thing that made you smile today?"
        };
      }
    }

    // For non-JSON responses, enforce brevity and clean up
    text = enforceResponseBrevity(text);
    return text;

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    
    // Provide a fallback response for testing if API is unavailable
    if (error.status === 404) {
      console.log("Using fallback response due to API configuration issue");
      return expectJson ? {
        "dailySuggestions": [
          {
            "title": "Take a Walk",
            "description": "Fresh air does wonders—go for a quick stroll, it’ll lift your mood!"
          }
        ],
        "mindfulnessActivities": [
          {
            "title": "Deep Breathing",
            "description": "A simple way to chill out fast",
            "duration": "5 minutes",
            "benefits": "Calms you down, makes you feel lighter",
            "instructions": ["Sit somewhere quiet", "Breathe in for 4 seconds", "Exhale for 4 seconds", "Repeat"],
            "guidance": "Don’t worry if your mind drifts—just focus back, friend!"
          }
        ],
        "journalingPrompt": "What’s one thing you’re looking forward to?"
      } : "I get that. Sometimes letting go is exactly what helps things come to you. Less attachment can create space for what you want.";
    }
    
    // Detect rate limiting errors (already handled in previous logs)
    if (error.message?.includes('RESOURCE_EXHAUSTED') || 
        error.message?.includes('quota') || 
        error.message?.includes('rate limit')) {
      throw {
        status: 429,
        message: 'Free messaging limit reached',
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
      };
    }
    
    throw error;
  }
};

/**
 * Force brevity on the response by truncating and cleaning
 */
const enforceResponseBrevity = (text) => {
  // Remove markdown formatting
  text = text.replace(/\*\*|__|\*|_|#|`/g, '');
  
  // Remove any bullet points or numbered lists
  text = text.replace(/^[\s-]*[-•*][\s]*/gm, '');
  text = text.replace(/^\d+\.[\s]*/gm, '');
  
  // Remove common AI phrases
  text = text.replace(/^(Hi|Hello|Hey)( there)?!?/i, '');
  text = text.replace(/(I understand|I see|As an AI|In my view|In my opinion)/gi, '');
  text = text.replace(/(It's important to note|It's worth mentioning)/gi, '');
  
  // Split into sentences and only keep the first two
  const sentences = text.split(/(?<=[.!?])\s+/);
  text = sentences.slice(0, 2).join(' ');
  
  // Enforce word count limit
  const words = text.split(/\s+/);
  if (words.length > 30) {
    text = words.slice(0, 30).join(' ') + '.';
  }
  
  return text.trim();
};

/**
 * Handle API response with appropriate status code
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 * @returns {object} HTTP response
 */
const handleResponse = (res, statusCode, data) => {
  return res.status(statusCode).json(data);
};

/**
 * Handle API errors consistently
 * @param {object} res - Express response object
 * @param {Error} error - Error object
 * @returns {object} Error response
 */
const handleError = (res, error) => {
  console.error("API Error:", error);
  
  // Default status code and message
  let statusCode = 500;
  let message = "Internal server error";
  
  // Check if error object has status and message
  if (error.status) {
    statusCode = error.status;
  }
  
  if (error.message) {
    message = error.message;
  }
  
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = {
  sendMessageToGemini,
  handleResponse,
  handleError
};