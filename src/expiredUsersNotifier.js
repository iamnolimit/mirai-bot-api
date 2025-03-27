const User = require('./models/User');
const axios = require('axios');

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Function to send message to Telegram
const sendTelegramMessage = async (chatId, message) => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('Telegram bot token not configured');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        console.log(`Message sent to Telegram chat ${chatId}`);
    } catch (error) {
        console.error('Error sending Telegram message:', error.message);
    }
};

// Function to notify user about expiry
const notifyUserExpiry = async (user) => {
    if (!user.telegramId) return;
    
    const message = `<b>⚠️ API Key Expiry Notice</b>\n\nHello ${user.name},\n\nYour API key has expired. Please extend your subscription to continue using our services.\n\nThank you for using Mirai API!`;
    
    await sendTelegramMessage(user.telegramId, message);
};

// Function to check for expired users and send notifications
const checkExpiredUsers = async () => {
    try {
        // Find users whose API keys expired today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const newlyExpiredUsers = await User.find({
            expiryDate: {
                $gte: today,
                $lt: tomorrow
            }
        });
        
        console.log(`Found ${newlyExpiredUsers.length} newly expired users`);
        
        // Notify each expired user
        for (const user of newlyExpiredUsers) {
            await notifyUserExpiry(user);
        }
        
        // Find users expiring in 3 days
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        
        const expiringUsers = await User.find({
            expiryDate: {
                $gte: tomorrow,
                $lt: threeDaysLater
            }
        });
        
        console.log(`Found ${expiringUsers.length} users expiring in 3 days`);
        
        // Notify each user expiring soon
        for (const user of expiringUsers) {
            const daysLeft = Math.ceil((user.expiryDate - today) / (1000 * 60 * 60 * 24));
            const message = `<b>⚠️ API Key Expiry Warning</b>\n\nHello ${user.name},\n\nYour API key will expire in ${daysLeft} days. Please extend your subscription to avoid service interruption.\n\nThank you for using Mirai API!`;
            await sendTelegramMessage(user.telegramId, message);
        }
    } catch (error) {
        console.error('Error in expiry check:', error);
    }
};

// Function to check for users approaching their request limit
const checkRequestLimits = async () => {
    try {
        // Find users who have used more than 80% of their daily limit
        const highUsageUsers = await User.find({
            $expr: {
                $gte: [
                    { $divide: ["$dailyRequests", "$maxRequestsPerDay"] },
                    0.8
                ]
            }
        });
        
        console.log(`Found ${highUsageUsers.length} users approaching their request limit`);
        
        // Notify each user approaching their limit
        for (const user of highUsageUsers) {
            const message = `<b>⚠️ API Request Limit Notice</b>\n\nHello ${user.name},\n\nYou have reached ${user.dailyRequests}/${user.maxRequestsPerDay} of your daily API request limit.\n\nYour limit will reset tomorrow.\n\nThank you for using Mirai API!`;
            await sendTelegramMessage(user.telegramId, message);
        }
    } catch (error) {
        console.error('Error in request limit check:', error);
    }
};

module.exports = {
    checkExpiredUsers,
    checkRequestLimits
};