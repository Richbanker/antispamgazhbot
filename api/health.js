module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Telegram Bot API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}; 