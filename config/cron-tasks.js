const nodemailer = require('nodemailer');
const cron = require('node-cron');

module.exports = {
  '*/1 * * * *': async () => {
    try {
      // Fetch all unsent notifications with related firstname data
      const notifications = await strapi.db.query('api::notification.notification').findMany({
        where: { emailSent: false },
        populate: { firstname: true },
      });

      console.log('Notifications fetched:', notifications);

      // Group notifications by unique email addresses
      const emailGroups = notifications.reduce((acc, notification) => {
        const userEmail = notification.firstname?.Email;
        if (userEmail) {
          if (!acc[userEmail]) {
            acc[userEmail] = [];
          }
          acc[userEmail].push(notification.id); // Keep track of notification IDs
        }
        return acc;
      }, {});

      // Process each unique email
      for (const [userEmail, notificationIds] of Object.entries(emailGroups)) {
        try {
          console.log('Start sending email to:', userEmail);

          // Use Nodemailer to send the email
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
              user: 'atsasmun@gmail.com',
              pass: 'bdygpeczrxtasqof',
            },
          });

          const info = await transporter.sendMail({
            from: '"Welcome Team" <atsasmun@gmail.com>',
            to: userEmail,
            subject: 'Welcome to Our Platform',
            text: `Hi ${notifications.find(n => n.firstname.Email === userEmail).firstname.FirstName || 'User'}, welcome to our platform!`,
          });

          console.log('Email successfully sent:', info.response);

          // Mark all notifications for this email as emailSent
          await strapi.db.query('api::notification.notification').updateMany({
            where: { id: { $in: notificationIds } }, // Update all related notifications
            data: { emailSent: true },
          });

        } catch (err) {
          console.error(`Error while sending email to ${userEmail}:`, err);
        }
      }
    } catch (err) {
      console.error('Error fetching or processing notifications:', err);
    }
  },
};
