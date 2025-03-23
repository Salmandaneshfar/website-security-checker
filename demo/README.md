# Website Security Checker - Demo

This directory contains demo files and examples for the Website Security Checker.

## Available Demos

1. **Web UI Demo**: Browse to `/demo.html` when running the application to see interactive demo examples.

2. **API Demo**: Run the `api-demo.js` script to test the API programmatically:

```bash
# Make sure the server is running first
npm start

# In a separate terminal, run:
node demo/api-demo.js
```

## Sample Output

The API demo will check multiple websites and show their security scores, with output similar to:

```
🔐 WEBSITE SECURITY CHECKER - API DEMO 🔐
=========================================
Checking multiple websites for security issues...

⚠️ Make sure the server is running with: npm start
Server should be available at: http://localhost:3000

🔍 Checking website: example.com
───────────────────────────────────────────────
✅ Security Score: 85/100
🌐 Domain: example.com
🔒 SSL Valid: Yes
📅 SSL Expires In: 180 days
🛡️ Security Headers: 4/7
🦠 Malware Detection: Safe
🔄 Mixed Content: None found

🔍 Checking website: google.com
───────────────────────────────────────────────
✅ Security Score: 95/100
🌐 Domain: google.com
🔒 SSL Valid: Yes
📅 SSL Expires In: 90 days
🛡️ Security Headers: 7/7
🦠 Malware Detection: Safe
🔄 Mixed Content: None found

...

✨ Demo completed! ✨
For more details, use the web interface at http://localhost:3000
```

## Web UI Demo Screenshots

Below is an example of what the web demo page looks like:

![Demo UI Screenshot](https://via.placeholder.com/800x400?text=Demo+UI+Screenshot)

The demo includes examples of:
- Secure websites (score 80-100)
- Moderately secure websites (score 60-79)
- Insecure websites (score below 60)

Each example shows detailed information about SSL certificates, security headers, malware detection, and mixed content issues.

## How It Works

The demos use a combination of:
1. Real-time API calls to check actual websites (when you enter a URL)
2. Pre-defined examples (when you click on the example cards)

This provides both real and educational examples for users to understand website security concepts. 