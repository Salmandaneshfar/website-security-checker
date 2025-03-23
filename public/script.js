document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('securityCheckForm');
  const urlInput = document.getElementById('urlInput');
  const includeSSL = document.getElementById('includeSSL');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const resultsSection = document.getElementById('resultsSection');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    if (!url) return;
    
    // Show loading spinner
    loadingSpinner.classList.remove('d-none');
    resultsSection.classList.add('d-none');
    
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
      displayResults(result);
    } catch (error) {
      console.error('Error:', error);
      displayError(error.message);
    } finally {
      loadingSpinner.classList.add('d-none');
    }
  });
  
  function displayResults(data) {
    // Show results section
    resultsSection.classList.remove('d-none');
    
    // Update security score
    const score = data.score;
    const scoreElement = document.getElementById('scoreValue');
    const scoreCircle = document.getElementById('securityScore');
    
    // Set score value
    scoreElement.textContent = Math.round(score);
    
    // Set score color
    let scoreColor;
    if (score >= 80) {
      scoreColor = '#28a745'; // Green
    } else if (score >= 60) {
      scoreColor = '#ffc107'; // Yellow
    } else {
      scoreColor = '#dc3545'; // Red
    }
    
    // Apply score styling to circle
    scoreCircle.style.setProperty('--score-color', scoreColor);
    scoreCircle.style.setProperty('--score-percent', `${score}%`);
    
    // Update result summary
    const summaryElement = document.getElementById('resultSummary');
    summaryElement.innerHTML = '';
    
    // SSL summary
    const sslItem = document.createElement('li');
    sslItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    const sslIcon = data.ssl.valid ? 
      '<i class="fas fa-check-circle success-icon me-2"></i>' : 
      '<i class="fas fa-times-circle danger-icon me-2"></i>';
    
    const sslText = data.ssl.valid ? 
      'SSL Certificate Valid' : 
      'SSL Certificate Invalid';
    
    const sslBadge = document.createElement('span');
    sslBadge.className = `badge summary-badge rounded-pill ${data.ssl.valid ? 'bg-success' : 'bg-danger'}`;
    sslBadge.textContent = data.ssl.valid ? 'Secure' : 'Insecure';
    
    sslItem.innerHTML = `${sslIcon} ${sslText}`;
    sslItem.appendChild(sslBadge);
    summaryElement.appendChild(sslItem);
    
    // Security headers summary
    const headersPresent = countPresentHeaders(data.headers);
    const headersItem = document.createElement('li');
    headersItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    let headersIcon, headersText, headersClass;
    if (headersPresent >= 5) {
      headersIcon = '<i class="fas fa-check-circle success-icon me-2"></i>';
      headersText = 'Security Headers';
      headersClass = 'bg-success';
    } else if (headersPresent >= 3) {
      headersIcon = '<i class="fas fa-exclamation-circle warning-icon me-2"></i>';
      headersText = 'Some Headers Missing';
      headersClass = 'bg-warning';
    } else {
      headersIcon = '<i class="fas fa-times-circle danger-icon me-2"></i>';
      headersText = 'Most Headers Missing';
      headersClass = 'bg-danger';
    }
    
    const headersBadge = document.createElement('span');
    headersBadge.className = `badge summary-badge rounded-pill ${headersClass}`;
    headersBadge.textContent = `${headersPresent}/7`;
    
    headersItem.innerHTML = `${headersIcon} ${headersText}`;
    headersItem.appendChild(headersBadge);
    summaryElement.appendChild(headersItem);
    
    // Malware summary
    const malwareItem = document.createElement('li');
    malwareItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    
    let malwareIcon, malwareText, malwareClass;
    if (!data.malware.checked) {
      malwareIcon = '<i class="fas fa-info-circle info-icon me-2"></i>';
      malwareText = 'Malware Check Not Available';
      malwareClass = 'bg-secondary';
    } else if (data.malware.safe) {
      malwareIcon = '<i class="fas fa-check-circle success-icon me-2"></i>';
      malwareText = 'No Malware Detected';
      malwareClass = 'bg-success';
    } else {
      malwareIcon = '<i class="fas fa-virus danger-icon me-2"></i>';
      malwareText = 'Malware Detected';
      malwareClass = 'bg-danger';
    }
    
    const malwareBadge = document.createElement('span');
    malwareBadge.className = `badge summary-badge rounded-pill ${malwareClass}`;
    malwareBadge.textContent = data.malware.checked ? (data.malware.safe ? 'Safe' : 'Threat') : 'N/A';
    
    malwareItem.innerHTML = `${malwareIcon} ${malwareText}`;
    malwareItem.appendChild(malwareBadge);
    summaryElement.appendChild(malwareItem);
    
    // Mixed content summary
    if (data.mixedContent) {
      const mixedItem = document.createElement('li');
      mixedItem.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      const hasMixedContent = data.mixedContent.found;
      const mixedIcon = !hasMixedContent ? 
        '<i class="fas fa-check-circle success-icon me-2"></i>' : 
        '<i class="fas fa-exclamation-triangle warning-icon me-2"></i>';
      
      const mixedText = !hasMixedContent ? 
        'No Mixed Content' : 
        'Mixed Content Detected';
      
      const mixedBadge = document.createElement('span');
      mixedBadge.className = `badge summary-badge rounded-pill ${!hasMixedContent ? 'bg-success' : 'bg-warning'}`;
      mixedBadge.textContent = hasMixedContent ? data.mixedContent.count : '0';
      
      mixedItem.innerHTML = `${mixedIcon} ${mixedText}`;
      mixedItem.appendChild(mixedBadge);
      summaryElement.appendChild(mixedItem);
    }
    
    // Populate SSL details
    populateSSLDetails(data.ssl);
    
    // Populate security headers details
    populateHeadersDetails(data.headers);
    
    // Populate malware details
    populateMalwareDetails(data.malware);
    
    // Populate mixed content details
    if (data.mixedContent) {
      populateMixedContentDetails(data.mixedContent);
    }
  }
  
  function countPresentHeaders(headers) {
    let count = 0;
    for (const [key, value] of Object.entries(headers)) {
      if (value && key !== 'error') count++;
    }
    return count;
  }
  
  function populateSSLDetails(ssl) {
    const sslDetails = document.getElementById('sslDetails');
    
    if (ssl.error) {
      sslDetails.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error checking SSL: ${ssl.error}
        </div>
      `;
      return;
    }
    
    const expiryDate = new Date(ssl.validTo);
    const formattedExpiryDate = expiryDate.toLocaleDateString();
    
    let statusClass = 'success';
    let statusText = 'Valid';
    
    if (!ssl.valid) {
      statusClass = 'danger';
      statusText = 'Invalid';
    } else if (ssl.daysRemaining < 30) {
      statusClass = 'warning';
      statusText = 'Expiring Soon';
    }
    
    sslDetails.innerHTML = `
      <div class="d-flex align-items-center mb-3">
        <span class="status-icon status-${statusClass}"></span>
        <strong>Status:</strong> <span class="badge bg-${statusClass} ms-2">${statusText}</span>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <p><strong>Expires In:</strong> ${ssl.daysRemaining} days</p>
          <p><strong>Expiry Date:</strong> ${formattedExpiryDate}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Valid For:</strong></p>
          <ul>
            ${ssl.domains.map(domain => `<li>${domain}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
  
  function populateHeadersDetails(headers) {
    const headersDetails = document.getElementById('headersDetails');
    
    if (headers.error) {
      headersDetails.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error checking headers: ${headers.error}
        </div>
      `;
      return;
    }
    
    const headersList = [
      { name: 'Content-Security-Policy', description: 'Helps prevent Cross-Site Scripting (XSS) and data injection attacks' },
      { name: 'Strict-Transport-Security', description: 'Forces browsers to use HTTPS for future site visits' },
      { name: 'X-Content-Type-Options', description: 'Prevents browsers from MIME-sniffing' },
      { name: 'X-Frame-Options', description: 'Protects from clickjacking attacks' },
      { name: 'X-XSS-Protection', description: 'Enables browser\'s XSS filtering' },
      { name: 'Referrer-Policy', description: 'Controls how much referrer information is included' },
      { name: 'Feature-Policy', description: 'Controls which browser features can be used' }
    ];
    
    let headersHtml = '';
    
    headersList.forEach(header => {
      const value = headers[header.name];
      const isPresent = value !== null;
      
      headersHtml += `
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
        headersHtml += `
          <div class="mb-3 small">
            <pre class="bg-light p-2 rounded">${value}</pre>
          </div>
        `;
      }
    });
    
    headersDetails.innerHTML = headersHtml;
  }
  
  function populateMalwareDetails(malware) {
    const malwareDetails = document.getElementById('malwareDetails');
    
    if (malware.error) {
      malwareDetails.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error checking malware: ${malware.error}
        </div>
      `;
      return;
    }
    
    if (!malware.checked) {
      malwareDetails.innerHTML = `
        <div class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          ${malware.message || 'Malware scanning is not available.'}
        </div>
      `;
      return;
    }
    
    if (malware.safe) {
      malwareDetails.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-shield-alt me-2"></i>
          No threats detected. This site is not flagged for malware or phishing.
        </div>
      `;
    } else {
      let threatsHtml = '';
      
      if (malware.threats && malware.threats.length > 0) {
        threatsHtml = `
          <div class="mt-3">
            <h6>Detected Threats:</h6>
            <ul>
              ${malware.threats.map(threat => `<li>${threat}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      malwareDetails.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-virus me-2"></i>
          <strong>Warning!</strong> This site is flagged for potential threats.
        </div>
        ${threatsHtml}
      `;
    }
  }
  
  function populateMixedContentDetails(mixedContent) {
    const mixedContentDetails = document.getElementById('mixedContentDetails');
    
    if (mixedContent.error) {
      mixedContentDetails.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle me-2"></i>
          Error checking mixed content: ${mixedContent.error}
        </div>
      `;
      return;
    }
    
    if (!mixedContent.found) {
      mixedContentDetails.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle me-2"></i>
          No mixed content detected. All resources are loaded securely.
        </div>
      `;
      return;
    }
    
    let resourcesHtml = '';
    
    if (mixedContent.resources && mixedContent.resources.length > 0) {
      resourcesHtml = `
        <div class="mt-3">
          <h6>Insecure Resources (${mixedContent.count} found):</h6>
          <div class="table-responsive">
            <table class="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                ${mixedContent.resources.map(resource => `
                  <tr>
                    <td>${resource.tag}</td>
                    <td class="text-break">${resource.url}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${mixedContent.count > mixedContent.resources.length ? 
            `<p class="small text-muted">Showing first ${mixedContent.resources.length} out of ${mixedContent.count} resources.</p>` : ''}
        </div>
      `;
    }
    
    mixedContentDetails.innerHTML = `
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Mixed Content Detected!</strong> Your site is loading some resources over insecure HTTP connections.
      </div>
      ${resourcesHtml}
    `;
  }
  
  function displayError(message) {
    resultsSection.classList.remove('d-none');
    resultsSection.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle me-2"></i>
        Error: ${message || 'Something went wrong while checking the website.'}
      </div>
    `;
  }
}); 