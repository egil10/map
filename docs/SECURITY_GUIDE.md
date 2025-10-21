# GeoQuest Security Guide

## Overview

This guide provides comprehensive security practices and guidelines for the GeoQuest application, covering data protection, input validation, secure coding practices, and compliance requirements.

## Security Architecture

### Security Layers
```
User Interface → Input Validation → Data Processing → Storage → Network
     ↓              ↓                ↓              ↓         ↓
Client Security → Server Security → Data Security → Storage → Transport
```

### Security Principles
- **Defense in Depth**: Multiple layers of security
- **Least Privilege**: Minimal access rights
- **Fail Secure**: Secure default configurations
- **Security by Design**: Built-in security features

## Input Validation and Sanitization

### 1. Client-Side Validation

#### Input Sanitization
```javascript
class InputSanitizer {
  constructor() {
    this.allowedTags = ['b', 'i', 'em', 'strong'];
    this.allowedAttributes = ['class', 'id'];
  }
  
  sanitizeHTML(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
  
  sanitizeText(input) {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[&"']/g, (match) => {
        const entities = { '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
        return entities[match];
      })
      .trim();
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  validateCountryName(name) {
    const countryRegex = /^[A-Za-z\s\-'\.]+$/;
    return countryRegex.test(name) && name.length <= 100;
  }
}
```

#### Form Validation
```javascript
class FormValidator {
  constructor(form) {
    this.form = form;
    this.rules = new Map();
    this.errors = new Map();
  }
  
  addRule(fieldName, rule) {
    this.rules.set(fieldName, rule);
  }
  
  validate() {
    this.errors.clear();
    let isValid = true;
    
    for (const [fieldName, rule] of this.rules) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      const value = field.value;
      
      if (!rule.validate(value)) {
        this.errors.set(fieldName, rule.message);
        isValid = false;
      }
    }
    
    return isValid;
  }
  
  getErrors() {
    return Object.fromEntries(this.errors);
  }
}

// Usage example
const validator = new FormValidator(document.getElementById('quiz-form'));
validator.addRule('countryName', {
  validate: (value) => /^[A-Za-z\s\-'\.]+$/.test(value),
  message: 'Country name contains invalid characters'
});
```

### 2. Data Validation

#### Schema Validation
```javascript
class DataValidator {
  constructor() {
    this.schemas = new Map();
    this.loadSchemas();
  }
  
  validateDataset(data) {
    const schema = this.schemas.get('dataset');
    return this.validateAgainstSchema(data, schema);
  }
  
  validateAgainstSchema(data, schema) {
    const errors = [];
    
    // Required fields validation
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Type validation
    for (const [field, type] of Object.entries(schema.properties)) {
      if (field in data && !this.validateType(data[field], type)) {
        errors.push(`Invalid type for field ${field}: expected ${type}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }
}
```

## Content Security Policy (CSP)

### 1. CSP Implementation

#### Meta Tag CSP
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://unpkg.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com; 
               img-src 'self' data: https:; 
               connect-src 'self';">
```

#### HTTP Header CSP
```javascript
// Server-side CSP headers
const cspHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};
```

### 2. CSP Reporting

#### CSP Violation Reporting
```javascript
document.addEventListener('securitypolicyviolation', (e) => {
  const violation = {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  };
  
  // Send violation report to server
  fetch('/csp-violation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(violation)
  });
});
```

## Secure Data Handling

### 1. Data Encryption

#### Client-Side Encryption
```javascript
class DataEncryption {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
  }
  
  async generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  async encrypt(data, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      encodedData
    );
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv)
    };
  }
  
  async decrypt(encryptedData, key) {
    const encrypted = new Uint8Array(encryptedData.encrypted);
    const iv = new Uint8Array(encryptedData.iv);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      encrypted
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  }
}
```

### 2. Secure Storage

#### Local Storage Security
```javascript
class SecureStorage {
  constructor() {
    this.encryption = new DataEncryption();
    this.key = null;
  }
  
  async initialize() {
    this.key = await this.encryption.generateKey();
  }
  
  async setItem(key, value) {
    if (!this.key) await this.initialize();
    
    const encrypted = await this.encryption.encrypt(value, this.key);
    localStorage.setItem(key, JSON.stringify(encrypted));
  }
  
  async getItem(key) {
    if (!this.key) await this.initialize();
    
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;
    
    const encrypted = JSON.parse(encryptedData);
    return await this.encryption.decrypt(encrypted, this.key);
  }
  
  removeItem(key) {
    localStorage.removeItem(key);
  }
}
```

## Network Security

### 1. HTTPS Implementation

#### HTTPS Enforcement
```javascript
// Force HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

#### Secure Headers
```javascript
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
```

### 2. CORS Configuration

#### CORS Headers
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400'
};
```

## Authentication and Authorization

### 1. Session Management

#### Secure Session Handling
```javascript
class SessionManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.lastActivity = Date.now();
  }
  
  startSession() {
    this.lastActivity = Date.now();
    this.setupActivityTracking();
  }
  
  setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
      }, true);
    });
  }
  
  checkSession() {
    const now = Date.now();
    if (now - this.lastActivity > this.sessionTimeout) {
      this.endSession();
      return false;
    }
    return true;
  }
  
  endSession() {
    // Clear sensitive data
    this.clearSensitiveData();
    
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### 2. Token Management

#### JWT Token Handling
```javascript
class TokenManager {
  constructor() {
    this.tokenKey = 'auth_token';
    this.refreshTokenKey = 'refresh_token';
  }
  
  setToken(token) {
    // Store token securely
    sessionStorage.setItem(this.tokenKey, token);
  }
  
  getToken() {
    return sessionStorage.getItem(this.tokenKey);
  }
  
  removeToken() {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }
  
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }
}
```

## Privacy Protection

### 1. Data Minimization

#### Minimal Data Collection
```javascript
class PrivacyManager {
  constructor() {
    this.collectedData = new Set();
    this.retentionPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
  }
  
  collectData(dataType, data) {
    // Only collect necessary data
    if (this.isDataNecessary(dataType)) {
      this.collectedData.add({
        type: dataType,
        data: data,
        timestamp: Date.now()
      });
    }
  }
  
  isDataNecessary(dataType) {
    const necessaryData = ['quiz_progress', 'user_preferences'];
    return necessaryData.includes(dataType);
  }
  
  cleanupOldData() {
    const now = Date.now();
    this.collectedData.forEach(item => {
      if (now - item.timestamp > this.retentionPeriod) {
        this.collectedData.delete(item);
      }
    });
  }
}
```

### 2. User Consent

#### Consent Management
```javascript
class ConsentManager {
  constructor() {
    this.consentKey = 'user_consent';
    this.consentVersion = '1.0';
  }
  
  hasConsent() {
    const consent = localStorage.getItem(this.consentKey);
    if (!consent) return false;
    
    const parsedConsent = JSON.parse(consent);
    return parsedConsent.version === this.consentVersion && parsedConsent.granted;
  }
  
  requestConsent() {
    return new Promise((resolve) => {
      const consentDialog = this.createConsentDialog();
      document.body.appendChild(consentDialog);
      
      consentDialog.addEventListener('consent-given', () => {
        this.grantConsent();
        resolve(true);
      });
      
      consentDialog.addEventListener('consent-denied', () => {
        resolve(false);
      });
    });
  }
  
  grantConsent() {
    const consent = {
      version: this.consentVersion,
      granted: true,
      timestamp: Date.now()
    };
    localStorage.setItem(this.consentKey, JSON.stringify(consent));
  }
}
```

## Vulnerability Prevention

### 1. XSS Prevention

#### Output Encoding
```javascript
class XSSPrevention {
  static encodeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  static encodeAttribute(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  static encodeURL(url) {
    return encodeURIComponent(url);
  }
}
```

### 2. CSRF Prevention

#### CSRF Token Implementation
```javascript
class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token';
  }
  
  generateToken() {
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenString = Array.from(token, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(this.tokenKey, tokenString);
    return tokenString;
  }
  
  getToken() {
    return sessionStorage.getItem(this.tokenKey);
  }
  
  validateToken(token) {
    const storedToken = this.getToken();
    return storedToken && storedToken === token;
  }
  
  addTokenToRequest(request) {
    const token = this.getToken();
    if (token) {
      request.headers['X-CSRF-Token'] = token;
    }
    return request;
  }
}
```

## Security Monitoring

### 1. Security Event Logging

#### Security Logger
```javascript
class SecurityLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }
  
  logSecurityEvent(event, details) {
    const logEntry = {
      timestamp: Date.now(),
      event: event,
      details: details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Send to server in production
    if (this.shouldSendToServer(event)) {
      this.sendToServer(logEntry);
    }
  }
  
  shouldSendToServer(event) {
    const criticalEvents = ['xss_attempt', 'csrf_attempt', 'injection_attempt'];
    return criticalEvents.includes(event);
  }
  
  async sendToServer(logEntry) {
    try {
      await fetch('/security-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send security log:', error);
    }
  }
}
```

### 2. Anomaly Detection

#### Anomaly Detection System
```javascript
class AnomalyDetector {
  constructor() {
    this.baseline = new Map();
    this.thresholds = {
      requestRate: 100, // requests per minute
      errorRate: 10,    // errors per minute
      dataSize: 1024    // KB per request
    };
  }
  
  detectAnomalies(metrics) {
    const anomalies = [];
    
    // Check request rate
    if (metrics.requestRate > this.thresholds.requestRate) {
      anomalies.push({
        type: 'high_request_rate',
        value: metrics.requestRate,
        threshold: this.thresholds.requestRate
      });
    }
    
    // Check error rate
    if (metrics.errorRate > this.thresholds.errorRate) {
      anomalies.push({
        type: 'high_error_rate',
        value: metrics.errorRate,
        threshold: this.thresholds.errorRate
      });
    }
    
    return anomalies;
  }
}
```

## Compliance and Standards

### 1. GDPR Compliance

#### GDPR Implementation
```javascript
class GDPRCompliance {
  constructor() {
    this.dataSubjects = new Map();
    this.processingPurposes = new Set();
  }
  
  registerDataSubject(id, data) {
    this.dataSubjects.set(id, {
      data: data,
      consent: false,
      timestamp: Date.now()
    });
  }
  
  requestDataDeletion(subjectId) {
    if (this.dataSubjects.has(subjectId)) {
      this.dataSubjects.delete(subjectId);
      this.clearRelatedData(subjectId);
      return true;
    }
    return false;
  }
  
  requestDataPortability(subjectId) {
    const subject = this.dataSubjects.get(subjectId);
    if (subject) {
      return {
        data: subject.data,
        format: 'JSON',
        timestamp: Date.now()
      };
    }
    return null;
  }
}
```

### 2. Security Standards

#### Security Checklist
```javascript
class SecurityChecklist {
  constructor() {
    this.checks = [
      'HTTPS_ENABLED',
      'CSP_HEADERS',
      'INPUT_VALIDATION',
      'OUTPUT_ENCODING',
      'SESSION_SECURITY',
      'DATA_ENCRYPTION',
      'ERROR_HANDLING',
      'LOGGING_ENABLED'
    ];
  }
  
  runSecurityChecks() {
    const results = {};
    
    this.checks.forEach(check => {
      results[check] = this.performCheck(check);
    });
    
    return results;
  }
  
  performCheck(check) {
    switch (check) {
      case 'HTTPS_ENABLED':
        return location.protocol === 'https:';
      case 'CSP_HEADERS':
        return this.checkCSPHeaders();
      case 'INPUT_VALIDATION':
        return this.checkInputValidation();
      default:
        return false;
    }
  }
}
```

## Best Practices

### 1. Secure Coding Practices
- **Input Validation**: Validate all user inputs
- **Output Encoding**: Encode all outputs
- **Error Handling**: Secure error handling
- **Logging**: Comprehensive security logging

### 2. Regular Security Updates
- **Dependencies**: Keep dependencies updated
- **Security Patches**: Apply security patches promptly
- **Vulnerability Scanning**: Regular vulnerability assessments
- **Security Testing**: Regular security testing

### 3. User Education
- **Security Awareness**: Educate users about security
- **Best Practices**: Share security best practices
- **Incident Response**: Clear incident response procedures
- **Reporting**: Easy security issue reporting

---

This security guide provides comprehensive security practices for the GeoQuest application, ensuring data protection, user privacy, and compliance with security standards.
