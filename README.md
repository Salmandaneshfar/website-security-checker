# Website Security Checker

A web-based tool that allows users to check websites for security issues, SSL/TLS certificates, security headers, malware, and mixed content.

![Website Security Checker Screenshot](https://via.placeholder.com/800x400?text=Website+Security+Checker)

## Features

- **SSL/TLS Certificate Check**: Validates the SSL certificate status, expiration date, and domains covered.
- **Security Headers Analysis**: Checks for important HTTP security headers that protect against common web vulnerabilities.
- **Malware & Phishing Detection**: Integration with Google Safe Browsing API to detect if a site is flagged for malware or phishing (requires API key).
- **Mixed Content Detection**: Finds insecure HTTP resources loaded on HTTPS pages that can compromise security.
- **Security Score**: Provides an overall security score based on all checks performed.

## Technologies Used

- Node.js
- Express.js
- Axios for HTTP requests
- Cheerio for HTML parsing
- Bootstrap 5 for UI
- Font Awesome for icons

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Salmandaneshfar/website-security-checker.git
cd website-security-checker
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) To enable malware/phishing checks, get a Google Safe Browsing API key and set it as an environment variable:

```bash
export GOOGLE_API_KEY=your_api_key_here
```

4. Start the server:

```bash
npm start
```

5. Visit `http://localhost:3000` in your browser to use the application.

## API Usage

The application provides a simple API endpoint:

**POST /api/check**

Request Body:
```json
{
  "url": "example.com"
}
```

Response:
```json
{
  "url": "https://example.com",
  "domain": "example.com",
  "score": 85,
  "timestamp": "2023-05-25T12:34:56.789Z",
  "ssl": {
    "valid": true,
    "daysRemaining": 120,
    "validFrom": "2023-01-25T00:00:00.000Z",
    "validTo": "2023-09-25T23:59:59.000Z",
    "domains": ["example.com", "www.example.com"]
  },
  "headers": {
    "Content-Security-Policy": "default-src 'self'",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Feature-Policy": null
  },
  "malware": {
    "checked": true,
    "safe": true,
    "threats": []
  },
  "mixedContent": {
    "found": false,
    "count": 0,
    "resources": []
  }
}
```

## License

MIT

## Author

Salman Daneshfar 