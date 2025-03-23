document.addEventListener('DOMContentLoaded', () => {
  const demoForm = document.getElementById('demoForm');
  const demoUrlInput = document.getElementById('demoUrlInput');
  const demoSpinner = document.getElementById('demoSpinner');
  const demoResults = document.getElementById('demoResults');
  
  // Handle form submit
  demoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = demoUrlInput.value.trim();
    if (!url) return;
    
    // Show loading spinner
    demoSpinner.classList.remove('d-none');
    demoResults.classList.add('d-none');
    
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      displayRealResult(result);
    } catch (error) {
      console.error('Error:', error);
      demoResults.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error: ${error.message || 'Something went wrong while checking the website.'}
        </div>
      `;
      demoResults.classList.remove('d-none');
    } finally {
      demoSpinner.classList.add('d-none');
    }
  });
  
  // Display real API result
  function displayRealResult(data) {
    // Calculate score class
    let scoreClass, scoreText;
    if (data.score >= 80) {
      scoreClass = 'success';
      scoreText = 'Good';
    } else if (data.score >= 60) {
      scoreClass = 'warning';
      scoreText = 'Moderate';
    } else {
      scoreClass = 'danger';
      scoreText = 'Poor';
    }
    
    // Calculate header count
    const headersCount = Object.values(data.headers).filter(h => h !== null).length;
    
    // Create summary HTML
    demoResults.innerHTML = `
      <div class="card mb-4">
        <div class="card-header bg-${scoreClass} text-white">
          <h5 class="mb-0">Security Report: ${scoreText} (${data.score}/100)</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 text-center mb-3">
              <div class="score-circle mb-2" style="--score-color: var(--bs-${scoreClass}); --score-percent: ${data.score}%;">
                <span id="demoScoreValue">${Math.round(data.score)}</span>
              </div>
              <p>Security Score</p>
            </div>
            <div class="col-md-8">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <i class="fas fa-globe me-2"></i>
                    Analyzed URL
                  </span>
                  <span class="badge bg-primary">${data.url}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <i class="fas ${data.ssl.valid ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} me-2"></i>
                    SSL Certificate
                  </span>
                  <span class="badge bg-${data.ssl.valid ? 'success' : 'danger'}">${data.ssl.valid ? 'Valid' : 'Invalid'}</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <i class="fas fa-code me-2"></i>
                    Security Headers
                  </span>
                  <span class="badge bg-${headersCount >= 5 ? 'success' : headersCount >= 3 ? 'warning' : 'danger'}">${headersCount}/7</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    <i class="fas fa-bug me-2"></i>
                    Malware Check
                  </span>
                  <span class="badge bg-${!data.malware.checked ? 'secondary' : data.malware.safe ? 'success' : 'danger'}">
                    ${!data.malware.checked ? 'Not Checked' : data.malware.safe ? 'Clean' : 'Threat Detected'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          <hr>
          
          <div class="text-center">
            <a href="/" class="btn btn-primary">
              <i class="fas fa-search me-2"></i>Run Full Security Check
            </a>
          </div>
        </div>
      </div>
    `;
    
    demoResults.classList.remove('d-none');
  }
});

// Load pre-defined example results
function loadExampleResult(type) {
  const demoResults = document.getElementById('demoResults');
  const demoSpinner = document.getElementById('demoSpinner');
  
  // Show loading spinner briefly for better UX
  demoSpinner.classList.remove('d-none');
  demoResults.classList.add('d-none');
  
  setTimeout(() => {
    demoSpinner.classList.add('d-none');
    
    let result;
    
    switch(type) {
      case 'secure':
        result = {
          url: 'https://example-secure.com',
          domain: 'example-secure.com',
          score: 95,
          timestamp: new Date().toISOString(),
          ssl: {
            valid: true,
            daysRemaining: 240,
            validFrom: '2023-01-01T00:00:00.000Z',
            validTo: '2023-12-31T23:59:59.000Z',
            domains: ['example-secure.com', 'www.example-secure.com']
          },
          headers: {
            'Content-Security-Policy': "default-src 'self'; script-src 'self'",
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Feature-Policy': "camera 'none'; microphone 'none'"
          },
          malware: {
            checked: true,
            safe: true,
            threats: []
          },
          mixedContent: {
            found: false,
            count: 0,
            resources: []
          }
        };
        break;
        
      case 'moderate':
        result = {
          url: 'https://example-moderate.com',
          domain: 'example-moderate.com',
          score: 65,
          timestamp: new Date().toISOString(),
          ssl: {
            valid: true,
            daysRemaining: 30,
            validFrom: '2023-01-01T00:00:00.000Z',
            validTo: '2023-05-01T23:59:59.000Z',
            domains: ['example-moderate.com']
          },
          headers: {
            'Content-Security-Policy': null,
            'Strict-Transport-Security': 'max-age=31536000',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': null,
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': null,
            'Feature-Policy': null
          },
          malware: {
            checked: true,
            safe: true,
            threats: []
          },
          mixedContent: {
            found: true,
            count: 2,
            resources: [
              { tag: 'script', url: 'http://example-moderate.com/analytics.js' },
              { tag: 'img', url: 'http://example-moderate.com/banner.jpg' }
            ]
          }
        };
        break;
        
      case 'poor':
        result = {
          url: 'https://example-poor.com',
          domain: 'example-poor.com',
          score: 30,
          timestamp: new Date().toISOString(),
          ssl: {
            valid: true,
            daysRemaining: 5,
            validFrom: '2022-06-01T00:00:00.000Z',
            validTo: '2023-04-05T23:59:59.000Z',
            domains: ['example-poor.com']
          },
          headers: {
            'Content-Security-Policy': null,
            'Strict-Transport-Security': null,
            'X-Content-Type-Options': null,
            'X-Frame-Options': null,
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': null,
            'Feature-Policy': null
          },
          malware: {
            checked: true,
            safe: false,
            threats: ['MALWARE', 'UNWANTED_SOFTWARE']
          },
          mixedContent: {
            found: true,
            count: 8,
            resources: [
              { tag: 'script', url: 'http://example-poor.com/main.js' },
              { tag: 'script', url: 'http://ads.example.com/track.js' },
              { tag: 'link', url: 'http://example-poor.com/styles.css' },
              { tag: 'iframe', url: 'http://ads.example.com/frame.html' }
            ]
          }
        };
        break;
        
      default:
        result = {
          error: 'Invalid example type'
        };
    }
    
    // Display the example result
    if (result.error) {
      demoResults.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error: ${result.error}
        </div>
      `;
    } else {
      displayExampleResult(result);
    }
    
    demoResults.classList.remove('d-none');
    
    // Scroll to results
    demoResults.scrollIntoView({ behavior: 'smooth' });
  }, 800);
}

// Display example result
function displayExampleResult(data) {
  const demoResults = document.getElementById('demoResults');
  
  // Calculate score class
  let scoreClass, scoreText;
  if (data.score >= 80) {
    scoreClass = 'success';
    scoreText = 'Good';
  } else if (data.score >= 60) {
    scoreClass = 'warning';
    scoreText = 'Moderate';
  } else {
    scoreClass = 'danger';
    scoreText = 'Poor';
  }
  
  // Calculate header count
  const headersCount = Object.values(data.headers).filter(h => h !== null).length;
  
  // Create results HTML
  let html = `
    <div class="card mb-4">
      <div class="card-header bg-${scoreClass} text-white">
        <h5 class="mb-0">Example Security Report: ${scoreText} (${data.score}/100)</h5>
      </div>
      <div class="card-body">
        <div class="row mb-4">
          <div class="col-md-4 text-center mb-3">
            <div class="score-circle mb-2" style="--score-color: var(--bs-${scoreClass}); --score-percent: ${data.score}%;">
              <span id="demoScoreValue">${Math.round(data.score)}</span>
            </div>
            <p>Security Score</p>
          </div>
          <div class="col-md-8">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <i class="fas fa-globe me-2"></i>
                  Example URL
                </span>
                <span class="badge bg-primary">${data.url}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <i class="fas ${data.ssl.valid ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} me-2"></i>
                  SSL Certificate
                </span>
                <span class="badge bg-${data.ssl.valid ? (data.ssl.daysRemaining < 30 ? 'warning' : 'success') : 'danger'}">
                  ${data.ssl.valid ? (data.ssl.daysRemaining < 30 ? `Expiring Soon (${data.ssl.daysRemaining} days)` : 'Valid') : 'Invalid'}
                </span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <i class="fas fa-code me-2"></i>
                  Security Headers
                </span>
                <span class="badge bg-${headersCount >= 5 ? 'success' : headersCount >= 3 ? 'warning' : 'danger'}">${headersCount}/7</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <i class="fas fa-bug me-2"></i>
                  Malware Check
                </span>
                <span class="badge bg-${!data.malware.checked ? 'secondary' : data.malware.safe ? 'success' : 'danger'}">
                  ${!data.malware.checked ? 'Not Checked' : data.malware.safe ? 'Clean' : 'Threat Detected'}
                </span>
              </li>
            </ul>
          </div>
        </div>
  `;
  
  // Add security breakdown
  html += `
    <h5 class="mb-3">Security Breakdown</h5>
    <div class="accordion" id="securityAccordion">
  `;
  
  // SSL section
  html += `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sslCollapse">
          <i class="fas fa-lock me-2"></i> SSL Certificate
        </button>
      </h2>
      <div id="sslCollapse" class="accordion-collapse collapse show" data-bs-parent="#securityAccordion">
        <div class="accordion-body">
          <div class="d-flex align-items-center mb-3">
            <span class="status-icon status-${data.ssl.daysRemaining < 30 ? 'warning' : 'success'}"></span>
            <strong>Status:</strong> 
            <span class="badge bg-${data.ssl.daysRemaining < 30 ? 'warning' : 'success'} ms-2">
              ${data.ssl.daysRemaining < 30 ? 'Expiring Soon' : 'Valid'}
            </span>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <p><strong>Expires In:</strong> ${data.ssl.daysRemaining} days</p>
              <p><strong>Expiry Date:</strong> ${new Date(data.ssl.validTo).toLocaleDateString()}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Valid For:</strong></p>
              <ul>
                ${data.ssl.domains.map(domain => `<li>${domain}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Headers section
  html += `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#headersCollapse">
          <i class="fas fa-code me-2"></i> Security Headers
        </button>
      </h2>
      <div id="headersCollapse" class="accordion-collapse collapse" data-bs-parent="#securityAccordion">
        <div class="accordion-body">
  `;
  
  const headersList = [
    { name: 'Content-Security-Policy', description: 'Helps prevent Cross-Site Scripting (XSS) and data injection attacks' },
    { name: 'Strict-Transport-Security', description: 'Forces browsers to use HTTPS for future site visits' },
    { name: 'X-Content-Type-Options', description: 'Prevents browsers from MIME-sniffing' },
    { name: 'X-Frame-Options', description: 'Protects from clickjacking attacks' },
    { name: 'X-XSS-Protection', description: 'Enables browser\'s XSS filtering' },
    { name: 'Referrer-Policy', description: 'Controls how much referrer information is included' },
    { name: 'Feature-Policy', description: 'Controls which browser features can be used' }
  ];
  
  headersList.forEach(header => {
    const value = data.headers[header.name];
    const isPresent = value !== null;
    
    html += `
      <div class="header-item ${isPresent ? 'present' : 'missing'}">
        <div>
          <strong>${header.name}</strong>
          <p class="mb-0 small text-muted">${header.description}</p>
        </div>
        <div>
          <span class="badge ${isPresent ? 'bg-success' : 'bg-danger'}">
            ${isPresent ? 'Present' : 'Missing'}
          </span>
        </div>
      </div>
    `;
    
    if (isPresent && value) {
      html += `
        <div class="mb-3 small">
          <pre class="bg-light p-2 rounded">${value}</pre>
        </div>
      `;
    }
  });
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  // Malware section
  html += `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#malwareCollapse">
          <i class="fas fa-bug me-2"></i> Malware Detection
        </button>
      </h2>
      <div id="malwareCollapse" class="accordion-collapse collapse" data-bs-parent="#securityAccordion">
        <div class="accordion-body">
  `;
  
  if (!data.malware.checked) {
    html += `
      <div class="alert alert-info">
        <i class="fas fa-info-circle me-2"></i>
        Malware scanning requires Google Safe Browsing API key.
      </div>
    `;
  } else if (data.malware.safe) {
    html += `
      <div class="alert alert-success">
        <i class="fas fa-shield-alt me-2"></i>
        No threats detected. This site is not flagged for malware or phishing.
      </div>
    `;
  } else {
    let threatsHtml = '';
    
    if (data.malware.threats && data.malware.threats.length > 0) {
      threatsHtml = `
        <div class="mt-3">
          <h6>Detected Threats:</h6>
          <ul>
            ${data.malware.threats.map(threat => `<li>${threat}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    html += `
      <div class="alert alert-danger">
        <i class="fas fa-virus me-2"></i>
        <strong>Warning!</strong> This site is flagged for potential threats.
      </div>
      ${threatsHtml}
    `;
  }
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  // Mixed content section
  html += `
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#mixedCollapse">
          <i class="fas fa-exclamation-triangle me-2"></i> Mixed Content
        </button>
      </h2>
      <div id="mixedCollapse" class="accordion-collapse collapse" data-bs-parent="#securityAccordion">
        <div class="accordion-body">
  `;
  
  if (!data.mixedContent.found) {
    html += `
      <div class="alert alert-success">
        <i class="fas fa-check-circle me-2"></i>
        No mixed content detected. All resources are loaded securely.
      </div>
    `;
  } else {
    let resourcesHtml = '';
    
    if (data.mixedContent.resources && data.mixedContent.resources.length > 0) {
      resourcesHtml = `
        <div class="mt-3">
          <h6>Insecure Resources (${data.mixedContent.count} found):</h6>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                ${data.mixedContent.resources.map(resource => `
                  <tr>
                    <td>${resource.tag}</td>
                    <td class="text-break">${resource.url}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    html += `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Mixed Content Detected!</strong> This site is loading some resources over insecure HTTP connections.
      </div>
      ${resourcesHtml}
    `;
  }
  
  html += `
        </div>
      </div>
    </div>
  `;
  
  // Close the accordion and card
  html += `
    </div> <!-- end accordion -->
    
    <div class="mt-4 text-center">
      <p class="text-muted mb-3">This is an example result. Check your own website for real results.</p>
      <a href="/" class="btn btn-primary">
        <i class="fas fa-search me-2"></i>Check Your Website
      </a>
    </div>
    
    </div> <!-- end card-body -->
    </div> <!-- end card -->
  `;
  
  demoResults.innerHTML = html;
} 