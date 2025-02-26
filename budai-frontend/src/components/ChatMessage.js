import React from "react";
import { motion } from "framer-motion";

const ChatMessage = ({ sender, text }) => (
  <motion.div
    className={`message ${sender}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="message-bubble">
      <p>{text}</p>
    </div>
  </motion.div>
);

export default ChatMessage;