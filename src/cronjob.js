const cron = require('node-cron');
const axios = require('axios');
const User = require('./models/User');

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '';

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

// Function to notify user about request limit
const notifyUserRequestLimit = async (user) => {
    if (!user.telegramId) return;
    
    const message = `<b>⚠️ API Request Limit Notice</b>\n\nHello ${user.name},\n\nYou have reached ${user.dailyRequests}/${user.maxRequestsPerDay} of your daily API request limit.\n\nYour limit will reset tomorrow.\n\nThank you for using Mirai API!`;
    
    await sendTelegramMessage(user.telegramId, message);
};

// Function to notify admin about system status
const sendAdminDailySummary = async () => {
    if (!ADMIN_CHAT_ID) {
        console.error('Admin chat ID not configured');
        return;
    }

    try {
        // Get total users
        const totalUsers = await User.countDocuments();
        
        // Get active users (not expired)
        const activeUsers = await User.countDocuments({
            expiryDate: { $gt: new Date() }
        });
        
        // Get expired users
        const expiredUsers = await User.countDocuments({
            expiryDate: { $lt: new Date() }
        });
        
        // Get users expiring in the next 3 days
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + 3);
        
        const expiringUsers = await User.countDocuments({
            expiryDate: { 
                $gt: new Date(),
                $lt: thresholdDate
            }
        });
        
        // Get high usage users (>80% of daily limit)
        const highUsageUsers = await User.find({
            $expr: {
                $gte: [
                    { $divide: ["$dailyRequests", "$maxRequestsPerDay"] },
                    0.8
                ]
            }
        }).count();
        
        const message = `<b>📊 Mirai API Daily Summary</b>\n\n` +
            `Total Users: ${totalUsers}\n` +
            `Active Users: ${activeUsers}\n` +
            `Expired Users: ${expiredUsers}\n` +
            `Users Expiring Soon: ${expiringUsers}\n` +
            `High Usage Users: ${highUsageUsers}\n`;
        
        await sendTelegramMessage(ADMIN_CHAT_ID, message);
    } catch (error) {
        console.error('Error generating admin summary:', error);
    }
};

// Daily job to reset request counters (runs at midnight)
const setupDailyReset = () => {
    // Schedule: At 00:00 every day
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily reset job...');
        try {
            // Reset all users' daily request counters
            await User.updateMany({}, { $set: { dailyRequests: 0 } });
            console.log('Daily request counters reset successfully');
            
            // Send daily summary to admin
            await sendAdminDailySummary();
        } catch (error) {
            console.error('Error in daily reset job:', error);
        }
    });
    console.log('Daily reset job scheduled');
};

// Job to check for expired users (runs every day at 9:00 AM)
const setupExpiryCheck = () => {
    // Schedule: At 09:00 every day
    cron.schedule('0 9 * * *', async () => {
        console.log('Running expiry check job...');
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
            console.error('Error in expiry check job:', error);
        }
    });
    console.log('Expiry check job scheduled');
};

// Job to check for users approaching their request limit (runs every 6 hours)
const setupRequestLimitCheck = () => {
    // Schedule: Every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('Running request limit check job...');
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
                await notifyUserRequestLimit(user);
            }
        } catch (error) {
            console.error('Error in request limit check job:', error);
        }
    });
    console.log('Request limit check job scheduled');
};

// Initialize all cron jobs
const initCronJobs = () => {
    setupDailyReset();
    setupExpiryCheck();
    setupRequestLimitCheck();
    console.log('All cron jobs initialized');
};

module.exports = { initCronJobs };