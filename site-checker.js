const axios = require('axios');
const cheerio = require('cheerio');
const sslChecker = require('ssl-checker');
const { SafeBrowsing } = require('google-safe-browsing');

// Initialize Google Safe Browsing (you'll need an API key)
// const safeBrowsing = new SafeBrowsing('YOUR_GOOGLE_API_KEY');

/**
 * Extract domain from URL
 * @param {string} url 
 * @returns {string}
 */
function extractDomain(url) {
  let domain;
  
  // Remove protocol and www if present
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  
  // Remove port number if present
  domain = domain.split(':')[0];
  
  // Remove www. if present
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  
  return domain;
}

/**
 * Check SSL/TLS certificate
 * @param {string} domain 
 * @returns {Promise<object>}
 */
async function checkSSL(domain) {
  try {
    const sslDetails = await sslChecker(domain, { 
      method: 'GET', 
      validateSubjectAltName: true 
    });
    
    return {
      ssl: {
        valid: sslDetails.valid,
        daysRemaining: sslDetails.daysRemaining,
        validFrom: sslDetails.validFrom,
        validTo: sslDetails.validTo,
        domains: sslDetails.validFor || [],
      }
    };
  } catch (error) {
    console.error('SSL check error:', error);
    return {
      ssl: {
        valid: false,
        error: error.message
      }
    };
  }
}

/**
 * Check for security headers
 * @param {string} url 
 * @returns {Promise<object>}
 */
async function checkSecurityHeaders(url) {
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
      timeout: 10000,
      maxRedirects: 5
    });
    
    const headers = response.headers;
    
    return {
      headers: {
        'Content-Security-Policy': headers['content-security-policy'] || null,
        'Strict-Transport-Security': headers['strict-transport-security'] || null,
        'X-Content-Type-Options': headers['x-content-type-options'] || null,
        'X-Frame-Options': headers['x-frame-options'] || null,
        'X-XSS-Protection': headers['x-xss-protection'] || null,
        'Referrer-Policy': headers['referrer-policy'] || null,
        'Feature-Policy': headers['feature-policy'] || headers['permissions-policy'] || null,
      }
    };
  } catch (error) {
    console.error('Headers check error:', error);
    return {
      headers: {
        error: error.message
      }
    };
  }
}

/**
 * Check if site is flagged for malware or phishing
 * Requires Google Safe Browsing API key
 * @param {string} url 
 * @returns {Promise<object>}
 */
async function checkMalwarePhishing(url) {
  // If you don't have a Google API key, return a placeholder
  if (!process.env.GOOGLE_API_KEY) {
    return {
      malware: {
        checked: false,
        message: "Google Safe Browsing API key required for malware checks"
      }
    };
  }
  
  try {
    // Initialize with environment variable
    const safeBrowsing = new SafeBrowsing(process.env.GOOGLE_API_KEY);
    
    const results = await safeBrowsing.lookup([url]);
    const isSafe = !results || !results[url] || results[url].length === 0;
    
    return {
      malware: {
        checked: true,
        safe: isSafe,
        threats: isSafe ? [] : results[url]
      }
    };
  } catch (error) {
    console.error('Malware check error:', error);
    return {
      malware: {
        checked: false,
        error: error.message
      }
    };
  }
}

/**
 * Check site for mixed content
 * @param {string} url 
 * @returns {Promise<object>}
 */
async function checkMixedContent(url) {
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
      timeout: 10000
    });
    
    // Parse HTML
    const $ = cheerio.load(response.data);
    const insecureResources = [];
    
    // Check for HTTP resources
    $('script[src^="http:"], link[href^="http:"], img[src^="http:"], iframe[src^="http:"]').each((i, el) => {
      const element = $(el);
      const tag = el.name;
      const attrName = tag === 'link' ? 'href' : 'src';
      
      insecureResources.push({
        tag,
        url: element.attr(attrName)
      });
    });
    
    return {
      mixedContent: {
        found: insecureResources.length > 0,
        count: insecureResources.length,
        resources: insecureResources.slice(0, 10) // Limit to first 10 items
      }
    };
  } catch (error) {
    console.error('Mixed content check error:', error);
    return {
      mixedContent: {
        error: error.message
      }
    };
  }
}

/**
 * Main site checker function
 * @param {string} urlInput 
 * @returns {Promise<object>}
 */
async function siteChecker(urlInput) {
  // Ensure URL has protocol
  let url = urlInput;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  const domain = extractDomain(url);
  
  // Run all checks in parallel
  const [sslResult, headersResult, malwareResult, mixedContentResult] = await Promise.all([
    checkSSL(domain),
    checkSecurityHeaders(url),
    checkMalwarePhishing(url),
    checkMixedContent(url)
  ]);
  
  // Calculate overall safety score (0-100)
  let score = 100;
  
  // Deduct for SSL issues
  if (!sslResult.ssl.valid) {
    score -= 40;
  } else if (sslResult.ssl.daysRemaining < 30) {
    score -= 20;
  }
  
  // Deduct for missing security headers
  const headers = headersResult.headers;
  if (!headers['Content-Security-Policy']) score -= 5;
  if (!headers['Strict-Transport-Security']) score -= 5;
  if (!headers['X-Content-Type-Options']) score -= 5;
  if (!headers['X-Frame-Options']) score -= 5;
  if (!headers['X-XSS-Protection']) score -= 5;
  
  // Deduct for malware/phishing
  if (malwareResult.malware.checked && !malwareResult.malware.safe) {
    score -= 50;
  }
  
  // Deduct for mixed content
  if (mixedContentResult.mixedContent.found) {
    score -= 10 * Math.min(mixedContentResult.mixedContent.count, 5);
  }
  
  // Ensure score is between 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Build final result
  return {
    url,
    domain,
    score,
    timestamp: new Date().toISOString(),
    ...sslResult,
    ...headersResult,
    ...malwareResult,
    ...mixedContentResult
  };
}

module.exports = {
  siteChecker
}; 