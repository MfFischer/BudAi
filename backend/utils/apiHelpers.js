// Define your API key handling and Google Gemini API integration
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
Ensure the JSON is fully formed, with all required fields and no truncation.
`;
    }

    brevityPrompt += `
${prompt}

REMEMBER: If JSON is requested, return a complete, valid JSON object. If text, keep it to 1-2 sentences, conversational, and brief like a text message.
`;

    // Updated model and strict configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200, // Increased to ensure full JSON object can fit
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
        
        // Attempt to repair incomplete JSON by adding closing brackets if needed
        if (!text.endsWith('}')) {
          text += '}'; // Try to close the JSON object
          console.log("Attempted to repair incomplete JSON:", text);
        }

        const jsonResponse = JSON.parse(text);
        return jsonResponse; // Return the parsed JSON object
      } catch (parseError) {
        console.error("Failed to parse Gemini JSON response in sendMessageToGemini:", parseError, "Raw response:", text);
        // Fallback to default JSON structure if parsing fails
        return {
          dailySuggestions: [
            {
              title: "Take a Mindful Break",
              description: "Practice deep breathing for a few minutes"
            }
          ],
          mindfulnessActivities: [
            {
              title: "Simple Breathing Exercise",
              description: "A calming breathing technique",
              duration: "5 minutes",
              benefits: "Reduces stress and anxiety, improves focus",
              instructions: ["Find a comfortable seated position", "Close your eyes gently", "Breathe in slowly for 4 counts", "Hold for 4 counts", "Exhale slowly for 4 counts", "Repeat for 5 minutes"],
              guidance: "If your mind wanders, gently bring your attention back to your breath"
            }
          ],
          journalingPrompt: "What's one small thing you're grateful for today?"
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
        dailySuggestions: [
          {
            title: "Take a Walk",
            description: "Clear your mind with a short stroll"
          }
        ],
        mindfulnessActivities: [
          {
            title: "Deep Breathing",
            description: "A quick relaxation technique",
            duration: "5 minutes",
            benefits: "Calms the mind, reduces stress",
            instructions: ["Sit comfortably", "Breathe in for 4 seconds", "Exhale for 4 seconds", "Repeat"],
            guidance: "Focus on your breath if your mind wanders"
          }
        ],
        journalingPrompt: "What’s one thing you’re looking forward to?"
      } : "I get that. Sometimes letting go is exactly what helps things come to you. Less attachment can create space for what you want.";
    }
    
    // Detect rate limiting errors
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