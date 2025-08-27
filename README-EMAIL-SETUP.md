# Email Setup for Snippet Feature

## Required Environment Variables

To enable the email functionality for sending snippets, you need to set up the following environment variables:

### 1. Create a `.env.local` file in the `web` directory:

```bash
# Email Configuration (Required for snippet sending)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM=your_verified_email@yourdomain.com

# Optional: Override default sender name
# RESEND_FROM=Your Name <your_verified_email@yourdomain.com>
```

### 2. Get a Resend API Key:

1. Sign up at [resend.com](https://resend.com)
2. Go to your dashboard
3. Create an API key
4. Copy the API key to your `.env.local` file

### 3. Verify Your Email Domain:

1. In your Resend dashboard, add and verify your domain
2. Or use the default `onboarding@resend.dev` for testing

### 4. Restart Your Development Server:

```bash
npm run dev
```

## Testing the Email Feature

1. Go to `/snippet` in your application
2. Enter a valid domain (e.g., `example.com`)
3. Click "Generate snippet"
4. Enter your email address
5. Click "Send snippet"

## Troubleshooting

- **"Email service not configured"**: Check that `RESEND_API_KEY` and `RESEND_FROM` are set correctly
- **"Failed to send snippet"**: Verify your Resend API key and email domain
- **"Cannot read properties of null"**: This should now be fixed with the improved error handling

## API Endpoints

- `POST /api/snippet/generate` - Generates a snippet for a domain
- `POST /api/snippet/send` - Sends the snippet via email
- `GET /api/sys/status` - Checks email configuration status

