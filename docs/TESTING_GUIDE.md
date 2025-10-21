# GeoQuest Testing Guide

## Overview

This guide provides comprehensive testing strategies and procedures for the GeoQuest application, covering unit testing, integration testing, performance testing, and user acceptance testing.

## Testing Strategy

### Testing Pyramid
```
        E2E Tests (Few)
       /              \
      /                \
     /                  \
    /                    \
   /                      \
  /                        \
 /                          \
/                            \
Integration Tests (Some)      Unit Tests (Many)
```

### Testing Levels
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **System Tests**: End-to-end functionality testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability and penetration testing

## Unit Testing

### 1. JavaScript Unit Testing

#### Test Setup with Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Quiz Game Unit Tests
```javascript
// tests/quiz.test.js
import { QuizGame } from '../src/js/quiz.js';

describe('QuizGame', () => {
  let quizGame;
  
  beforeEach(() => {
    quizGame = new QuizGame();
  });
  
  describe('Answer Validation', () => {
    test('should validate correct answers', () => {
      quizGame.currentQuiz = {
        answer_variations: ['United States', 'USA', 'US']
      };
      
      const result = quizGame.checkAnswer('United States');
      expect(result.success).toBe(true);
    });
    
    test('should validate case-insensitive answers', () => {
      quizGame.currentQuiz = {
        answer_variations: ['United States', 'USA', 'US']
      };
      
      const result = quizGame.checkAnswer('united states');
      expect(result.success).toBe(true);
    });
    
    test('should reject incorrect answers', () => {
      quizGame.currentQuiz = {
        answer_variations: ['United States', 'USA', 'US']
      };
      
      const result = quizGame.checkAnswer('Canada');
      expect(result.success).toBe(false);
    });
  });
  
  describe('Score Calculation', () => {
    test('should award points for correct answers', () => {
      const initialScore = quizGame.score;
      quizGame.updateScore(10);
      expect(quizGame.score).toBe(initialScore + 10);
    });
    
    test('should track streaks correctly', () => {
      quizGame.updateScore(10);
      quizGame.updateScore(10);
      expect(quizGame.streak).toBe(2);
    });
  });
  
  describe('Hint System', () => {
    test('should provide hints from tags', () => {
      quizGame.currentQuiz = {
        tags: ['population', 'demographics', 'statistics']
      };
      
      const hint = quizGame.getHint();
      expect(quizGame.currentQuiz.tags).toContain(hint);
    });
  });
});
```

#### Map Component Unit Tests
```javascript
// tests/map.test.js
import { WorldMap } from '../src/js/map.js';

describe('WorldMap', () => {
  let worldMap;
  
  beforeEach(() => {
    worldMap = new WorldMap();
  });
  
  describe('Country Styling', () => {
    test('should apply correct colors to countries', () => {
      const feature = {
        properties: { name: 'United States' }
      };
      
      worldMap.currentQuiz = {
        countries: {
          'United States': { value: 100, color: '#ff0000' }
        }
      };
      
      const style = worldMap.getCountryStyle(feature);
      expect(style.fillColor).toBe('#ff0000');
    });
    
    test('should use default color for countries without data', () => {
      const feature = {
        properties: { name: 'Unknown Country' }
      };
      
      worldMap.currentQuiz = {
        countries: {}
      };
      
      const style = worldMap.getCountryStyle(feature);
      expect(style.fillColor).toBe('#ffffff');
    });
  });
  
  describe('Legend Creation', () => {
    test('should create gradient legend for numeric data', () => {
      const quiz = {
        colorScheme: {
          type: 'gradient',
          minColor: '#ffffff',
          maxColor: '#000000'
        }
      };
      
      const legend = worldMap.createLegend(quiz);
      expect(legend).toBeDefined();
    });
  });
});
```

### 2. CSS Testing

#### Visual Regression Testing
```javascript
// tests/visual.test.js
import puppeteer from 'puppeteer';

describe('Visual Regression Tests', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  test('should match snapshot of main page', async () => {
    await page.goto('http://localhost:8000');
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot('main-page.png');
  });
  
  test('should match snapshot of quiz interface', async () => {
    await page.goto('http://localhost:8000');
    await page.click('[data-testid="start-quiz"]');
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot('quiz-interface.png');
  });
});
```

## Integration Testing

### 1. Component Integration Tests

#### Quiz and Map Integration
```javascript
// tests/integration/quiz-map.test.js
describe('Quiz and Map Integration', () => {
  let app;
  
  beforeEach(async () => {
    app = new App();
    await app.init();
  });
  
  test('should update map when quiz changes', async () => {
    const initialMapData = app.mapInstance.currentQuiz;
    
    await app.quizInstance.startNewQuiz();
    
    expect(app.mapInstance.currentQuiz).not.toEqual(initialMapData);
    expect(app.mapInstance.currentQuiz).toBeDefined();
  });
  
  test('should display correct country colors', async () => {
    await app.quizInstance.startNewQuiz();
    
    const mapLayers = app.mapInstance.map.getLayers();
    const countriesLayer = mapLayers.find(layer => layer.options.name === 'countries');
    
    expect(countriesLayer).toBeDefined();
    expect(countriesLayer.getLayers().length).toBeGreaterThan(0);
  });
});
```

#### Data Loading Integration
```javascript
// tests/integration/data-loading.test.js
describe('Data Loading Integration', () => {
  test('should load all datasets successfully', async () => {
    const quizGame = new QuizGame();
    await quizGame.loadQuizData();
    
    expect(quizGame.datasetList.length).toBeGreaterThan(0);
    expect(quizGame.datasetList.every(dataset => dataset.title)).toBe(true);
  });
  
  test('should handle invalid datasets gracefully', async () => {
    const quizGame = new QuizGame();
    
    // Mock invalid dataset
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404
    });
    
    await expect(quizGame.loadQuizData()).resolves.not.toThrow();
  });
});
```

### 2. API Integration Tests

#### Data API Testing
```javascript
// tests/integration/api.test.js
describe('Data API Integration', () => {
  test('should fetch dataset successfully', async () => {
    const response = await fetch('/data/world_population_2025.json');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.title).toBeDefined();
    expect(data.data).toBeDefined();
  });
  
  test('should handle network errors gracefully', async () => {
    // Mock network error
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    const quizGame = new QuizGame();
    await expect(quizGame.loadQuizData()).resolves.not.toThrow();
  });
});
```

## End-to-End Testing

### 1. Playwright E2E Tests

#### Test Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:8000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
};
```

#### E2E Test Scenarios
```javascript
// tests/e2e/quiz-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('should complete full quiz session', async ({ page }) => {
    await page.goto('/');
    
    // Start quiz
    await page.click('[data-testid="start-quiz"]');
    await expect(page.locator('[data-testid="quiz-interface"]')).toBeVisible();
    
    // Answer questions
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="guess-input"]', 'Test Answer');
      await page.click('[data-testid="submit-guess"]');
      await page.waitForSelector('[data-testid="feedback"]');
    }
    
    // Check completion
    await expect(page.locator('[data-testid="completion-screen"]')).toBeVisible();
  });
  
  test('should handle multiple choice mode', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="multiple-choice-mode"]');
    
    // Select answer
    await page.click('[data-testid="choice-button"]:first-child');
    await expect(page.locator('[data-testid="choice-button"].correct')).toBeVisible();
  });
  
  test('should navigate learn mode', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="learn-mode"]');
    
    // Navigate through datasets
    await page.click('[data-testid="next-dataset"]');
    await expect(page.locator('[data-testid="dataset-title"]')).toBeVisible();
  });
});
```

#### Cross-Browser Testing
```javascript
// tests/e2e/cross-browser.spec.js
import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work in Chrome', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="main-interface"]')).toBeVisible();
  });
  
  test('should work in Firefox', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="main-interface"]')).toBeVisible();
  });
  
  test('should work in Safari', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="main-interface"]')).toBeVisible();
  });
});
```

## Performance Testing

### 1. Load Testing

#### Load Test Configuration
```javascript
// tests/performance/load-test.js
import k6 from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

export default function() {
  let response = http.get('http://localhost:8000');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

#### Performance Benchmarks
```javascript
// tests/performance/benchmarks.js
describe('Performance Benchmarks', () => {
  test('should load within 3 seconds', async () => {
    const startTime = performance.now();
    await page.goto('/');
    const loadTime = performance.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('should render map within 500ms', async () => {
    await page.goto('/');
    
    const startTime = performance.now();
    await page.waitForSelector('[data-testid="map-container"]');
    const renderTime = performance.now() - startTime;
    
    expect(renderTime).toBeLessThan(500);
  });
  
  test('should handle 100 concurrent users', async () => {
    const promises = Array(100).fill().map(() => 
      page.goto('/')
    );
    
    const results = await Promise.all(promises);
    expect(results.every(result => result.ok())).toBe(true);
  });
});
```

### 2. Memory Testing

#### Memory Leak Detection
```javascript
// tests/performance/memory.test.js
describe('Memory Management', () => {
  test('should not leak memory during quiz sessions', async () => {
    const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
    
    // Simulate multiple quiz sessions
    for (let i = 0; i < 10; i++) {
      await page.click('[data-testid="start-quiz"]');
      await page.fill('[data-testid="guess-input"]', 'Test');
      await page.click('[data-testid="submit-guess"]');
      await page.click('[data-testid="next-question"]');
    }
    
    const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
  });
});
```

## Security Testing

### 1. Vulnerability Testing

#### XSS Testing
```javascript
// tests/security/xss.test.js
describe('XSS Protection', () => {
  test('should prevent XSS in user input', async () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    
    await page.fill('[data-testid="guess-input"]', maliciousInput);
    await page.click('[data-testid="submit-guess"]');
    
    // Check that script was not executed
    const alerts = await page.evaluate(() => window.alerts);
    expect(alerts).toBeUndefined();
  });
  
  test('should sanitize country names', async () => {
    const maliciousCountry = 'Country<script>alert("XSS")</script>';
    
    // This should be handled by the country mapping system
    const result = await page.evaluate((country) => {
      return window.quizInstance.checkAnswer(country);
    }, maliciousCountry);
    
    expect(result.success).toBe(false);
  });
});
```

#### CSRF Testing
```javascript
// tests/security/csrf.test.js
describe('CSRF Protection', () => {
  test('should reject requests without CSRF token', async () => {
    const response = await page.request.post('/api/submit-answer', {
      data: { answer: 'Test' }
    });
    
    expect(response.status()).toBe(403);
  });
});
```

### 2. Data Security Testing

#### Data Validation Testing
```javascript
// tests/security/data-validation.test.js
describe('Data Validation', () => {
  test('should validate dataset format', async () => {
    const invalidDataset = {
      title: '',
      data: 'invalid'
    };
    
    const result = await page.evaluate((dataset) => {
      return window.quizInstance.validateDataset(dataset);
    }, invalidDataset);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

## Accessibility Testing

### 1. Automated Accessibility Testing

#### axe-core Integration
```javascript
// tests/accessibility/axe.test.js
import { injectAxe, checkA11y } from 'axe-playwright';

describe('Accessibility Tests', () => {
  test('should pass accessibility checks', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page);
  });
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="quiz-interface"]')).toBeVisible();
  });
});
```

### 2. Screen Reader Testing

#### Screen Reader Simulation
```javascript
// tests/accessibility/screen-reader.test.js
describe('Screen Reader Compatibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    const elements = await page.locator('[aria-label]').all();
    expect(elements.length).toBeGreaterThan(0);
  });
  
  test('should announce quiz state changes', async ({ page }) => {
    await page.goto('/');
    
    // Start quiz
    await page.click('[data-testid="start-quiz"]');
    
    // Check for aria-live regions
    const liveRegion = page.locator('[aria-live]');
    await expect(liveRegion).toBeVisible();
  });
});
```

## Test Automation

### 1. CI/CD Integration

#### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Run performance tests
        run: npm run test:performance
        
      - name: Run security tests
        run: npm run test:security
        
      - name: Run accessibility tests
        run: npm run test:accessibility
```

### 2. Test Reporting

#### Coverage Reporting
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Test Results Dashboard
```javascript
// tests/reporting/results.js
class TestReporter {
  constructor() {
    this.results = [];
  }
  
  addResult(testName, status, duration, error) {
    this.results.push({
      testName,
      status,
      duration,
      error,
      timestamp: Date.now()
    });
  }
  
  generateReport() {
    const summary = {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      duration: this.results.reduce((sum, r) => sum + r.duration, 0)
    };
    
    return {
      summary,
      results: this.results
    };
  }
}
```

## Best Practices

### 1. Test Organization
- **Clear Naming**: Use descriptive test names
- **Single Responsibility**: One test per scenario
- **Independent Tests**: Tests should not depend on each other
- **Fast Execution**: Keep tests fast and efficient

### 2. Test Data Management
- **Test Fixtures**: Use consistent test data
- **Mocking**: Mock external dependencies
- **Cleanup**: Clean up after tests
- **Isolation**: Isolate test environments

### 3. Continuous Testing
- **Automated Execution**: Run tests automatically
- **Fast Feedback**: Provide quick test results
- **Quality Gates**: Block deployments on test failures
- **Monitoring**: Monitor test health and performance

---

This testing guide provides comprehensive testing strategies for the GeoQuest application, ensuring quality, reliability, and user satisfaction through thorough testing practices.
