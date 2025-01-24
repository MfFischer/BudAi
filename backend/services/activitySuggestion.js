const suggestActivities = (emotion) => {
    const activities = {
      happy: [
        "Go for a walk in nature.",
        "Listen to your favorite music.",
        "Write in a gratitude journal.",
      ],
      sad: [
        "Talk to a friend or family member.",
        "Watch a comforting movie.",
        "Practice deep breathing exercises.",
      ],
      neutral: [
        "Try a new hobby.",
        "Read a book.",
        "Plan your next vacation.",
      ],
    };
  
    if (emotion.score > 0.5) {
      return activities.happy;
    } else if (emotion.score < -0.5) {
      return activities.sad;
    } else {
      return activities.neutral;
    }
  };
  
  module.exports = { suggestActivities };
