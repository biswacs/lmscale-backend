const calculateTokens = (text) => {
  if (!text) return 0;

  const str = String(text);

  const tokens = str.trim().split(/[\s,.!?;:"'\[\]{}()\n\t]+/);

  const tokenCount = tokens.filter((token) => token.length > 0).length;

  const longWordPenalty = tokens.reduce((acc, token) => {
    return acc + Math.max(0, Math.floor(token.length / 8));
  }, 0);

  const specialCharPenalty = (str.match(/[^a-zA-Z0-9\s]/g) || []).length;

  return Math.max(1, tokenCount + longWordPenalty + specialCharPenalty);
};

const calculateMessagesTokens = (messages) => {
  if (!Array.isArray(messages)) return 0;

  return messages.reduce((total, message) => {
    if (!message || !message.content) return total;
    return total + calculateTokens(message.content);
  }, 0);
};

module.exports = {
  calculateTokens,
  calculateMessagesTokens,
};
