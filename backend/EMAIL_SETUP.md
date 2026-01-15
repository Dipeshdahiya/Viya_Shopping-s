# Email Configuration Notes

## Gmail Setup

If emails are not being sent, you may need to:

1. **Enable "Less secure app access"** (if available) OR
2. **Use an App Password** (Recommended for Gmail accounts with 2FA enabled)

### Steps to create App Password:

1. Go to your Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", enable it if not already enabled
4. Go to "App passwords"
5. Create a new app password for "Mail"
6. Copy the 16-character password
7. Replace `pizzapizza12@` in `settings.py` with the app password

### Current Email Configuration:
- Email: connect.veya@gmail.com
- SMTP: smtp.gmail.com
- Port: 587
- TLS: Enabled

### Testing Email:

You can test email functionality by registering a new user. Check the console logs for any email sending errors.

