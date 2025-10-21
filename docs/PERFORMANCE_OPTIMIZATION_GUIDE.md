# GeoQuest Performance Optimization Guide

## Overview

This guide provides comprehensive strategies and techniques for optimizing the performance of the GeoQuest application, covering loading times, rendering performance, memory usage, and user experience.

## Performance Metrics

### Key Performance Indicators
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3 seconds

### Loading Performance
- **Initial Load Time**: < 3 seconds on broadband
- **Data Processing**: < 1 second for 134 datasets
- **Map Rendering**: < 500ms for world map
- **Quiz Transitions**: < 200ms between questions

### Memory Performance
- **Base Memory Usage**: ~15MB
- **Peak Memory Usage**: ~35MB
- **Memory Growth**: < 5MB per hour
- **Garbage Collection**: Efficient memory cleanup

## Loading Optimization

### 1. Resource Optimization

#### JavaScript Optimization
```javascript
// Code splitting for better loading
const loadMapModule = () => import('./js/map.js');
const loadQuizModule = () => import('./js/quiz.js');

// Lazy loading of components
async function initializeApp() {
  const [mapModule, quizModule] = await Promise.all([
    loadMapModule(),
    loadQuizModule()
  ]);
  
  // Initialize components
  window.mapInstance = new mapModule.WorldMap();
  window.quizInstance = new quizModule.QuizGame();
}
```

#### CSS Optimization
```css
/* Critical CSS inlined */
.critical-styles {
  /* Above-the-fold styles */
}

/* Non-critical CSS loaded asynchronously */
<link rel="preload" href="css/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

#### Image and Asset Optimization
```javascript
// Image optimization
const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Lazy loading
    img.loading = 'lazy';
    
    // Responsive images
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
    }
  });
};
```

### 2. Data Loading Strategies

#### Lazy Loading Implementation
```javascript
class DataLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }
  
  async loadDataset(filename) {
    // Check cache first
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }
    
    // Check if already loading
    if (this.loading.has(filename)) {
      return this.waitForLoad(filename);
    }
    
    // Load data
    this.loading.add(filename);
    try {
      const data = await this.fetchData(filename);
      this.cache.set(filename, data);
      return data;
    } finally {
      this.loading.delete(filename);
    }
  }
}
```

#### Data Compression
```javascript
// Gzip compression for data files
const compressData = (data) => {
  const jsonString = JSON.stringify(data);
  const compressed = pako.gzip(jsonString);
  return compressed;
};

// Decompression
const decompressData = (compressed) => {
  const decompressed = pako.ungzip(compressed);
  return JSON.parse(new TextDecoder().decode(decompressed));
};
```

### 3. Caching Strategies

#### Memory Caching
```javascript
class CacheManager {
  constructor(maxSize = 100, ttl = 300000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  set(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
}
```

#### Browser Caching
```javascript
// Service Worker for caching
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/data/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(response => {
            const responseClone = response.clone();
            caches.open('data-cache').then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
        })
    );
  }
});
```

## Rendering Optimization

### 1. Map Rendering Performance

#### Efficient Map Updates
```javascript
class MapOptimizer {
  constructor(map) {
    this.map = map;
    this.updateQueue = [];
    this.isUpdating = false;
  }
  
  queueUpdate(updateFunction) {
    this.updateQueue.push(updateFunction);
    if (!this.isUpdating) {
      this.processUpdates();
    }
  }
  
  async processUpdates() {
    this.isUpdating = true;
    
    while (this.updateQueue.length > 0) {
      const update = this.updateQueue.shift();
      await update();
      
      // Yield to browser
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    this.isUpdating = false;
  }
}
```

#### Style Optimization
```javascript
// Batch style updates
const batchStyleUpdates = (features, styles) => {
  const styleMap = new Map();
  
  features.forEach(feature => {
    const style = styles[feature.properties.name];
    if (style) {
      styleMap.set(feature.properties.name, style);
    }
  });
  
  // Apply all styles at once
  this.map.eachLayer(layer => {
    const style = styleMap.get(layer.feature.properties.name);
    if (style) {
      layer.setStyle(style);
    }
  });
};
```

### 2. DOM Optimization

#### Efficient DOM Updates
```javascript
class DOMOptimizer {
  constructor() {
    this.updateQueue = [];
    this.isUpdating = false;
  }
  
  batchUpdate(updateFunction) {
    this.updateQueue.push(updateFunction);
    if (!this.isUpdating) {
      requestAnimationFrame(() => this.processUpdates());
    }
  }
  
  processUpdates() {
    this.isUpdating = true;
    
    // Create document fragment for batch updates
    const fragment = document.createDocumentFragment();
    
    this.updateQueue.forEach(update => {
      update(fragment);
    });
    
    // Apply all updates at once
    document.body.appendChild(fragment);
    
    this.updateQueue = [];
    this.isUpdating = false;
  }
}
```

#### Virtual Scrolling
```javascript
class VirtualScroller {
  constructor(container, itemHeight, items) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.visibleItems = [];
    this.scrollTop = 0;
    
    this.setupScrolling();
  }
  
  setupScrolling() {
    this.container.addEventListener('scroll', this.throttle(() => {
      this.updateVisibleItems();
    }, 16));
  }
  
  updateVisibleItems() {
    const containerHeight = this.container.clientHeight;
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / this.itemHeight),
      this.items.length
    );
    
    this.renderItems(startIndex, endIndex);
  }
}
```

### 3. Animation Optimization

#### RequestAnimationFrame Usage
```javascript
class AnimationManager {
  constructor() {
    this.animations = new Set();
    this.isRunning = false;
  }
  
  addAnimation(animation) {
    this.animations.add(animation);
    if (!this.isRunning) {
      this.startAnimationLoop();
    }
  }
  
  startAnimationLoop() {
    this.isRunning = true;
    
    const animate = () => {
      this.animations.forEach(animation => {
        if (animation.update()) {
          animation.render();
        } else {
          this.animations.delete(animation);
        }
      });
      
      if (this.animations.size > 0) {
        requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
      }
    };
    
    requestAnimationFrame(animate);
  }
}
```

#### CSS Animation Optimization
```css
/* Use transform and opacity for animations */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force hardware acceleration */
}

/* Avoid animating layout properties */
.smooth-animation {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Use CSS animations for better performance */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Memory Optimization

### 1. Memory Management

#### Object Pooling
```javascript
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    this.pool = [];
  }
  
  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}

// Usage example
const buttonPool = new ObjectPool(
  () => document.createElement('button'),
  (button) => {
    button.className = '';
    button.textContent = '';
    button.onclick = null;
  }
);
```

#### Memory Monitoring
```javascript
class MemoryMonitor {
  constructor() {
    this.initialMemory = this.getMemoryUsage();
    this.peakMemory = this.initialMemory;
    this.memoryHistory = [];
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
  
  checkMemory() {
    const current = this.getMemoryUsage();
    if (current) {
      this.peakMemory = Math.max(this.peakMemory, current.used);
      this.memoryHistory.push(current.used);
      
      // Keep only last 100 measurements
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }
      
      // Check for memory leaks
      if (current.used > this.initialMemory * 2) {
        console.warn('Potential memory leak detected');
      }
    }
  }
}
```

### 2. Event Listener Optimization

#### Event Delegation
```javascript
class EventManager {
  constructor() {
    this.delegatedEvents = new Map();
  }
  
  delegate(selector, eventType, handler) {
    const key = `${selector}:${eventType}`;
    
    if (!this.delegatedEvents.has(key)) {
      document.addEventListener(eventType, (e) => {
        if (e.target.matches(selector)) {
          handler(e);
        }
      });
      this.delegatedEvents.set(key, true);
    }
  }
  
  removeDelegation(selector, eventType) {
    const key = `${selector}:${eventType}`;
    this.delegatedEvents.delete(key);
  }
}
```

#### Throttling and Debouncing
```javascript
class PerformanceUtils {
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  static debounce(func, delay) {
    let timeoutId;
    return function() {
      const args = arguments;
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
  }
}
```

## Network Optimization

### 1. Request Optimization

#### Request Batching
```javascript
class RequestBatcher {
  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.timeout = null;
  }
  
  addRequest(request) {
    this.queue.push(request);
    
    if (this.queue.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.processBatch(), this.delay);
    }
  }
  
  async processBatch() {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    const promises = batch.map(request => this.executeRequest(request));
    
    await Promise.all(promises);
    
    if (this.queue.length > 0) {
      this.timeout = setTimeout(() => this.processBatch(), this.delay);
    } else {
      this.timeout = null;
    }
  }
}
```

#### Connection Pooling
```javascript
class ConnectionPool {
  constructor(maxConnections = 6) {
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.queue = [];
  }
  
  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.activeConnections >= this.maxConnections || this.queue.length === 0) {
      return;
    }
    
    const { url, options, resolve, reject } = this.queue.shift();
    this.activeConnections++;
    
    try {
      const response = await fetch(url, options);
      resolve(response);
    } catch (error) {
      reject(error);
    } finally {
      this.activeConnections--;
      this.processQueue();
    }
  }
}
```

### 2. Data Compression

#### Compression Implementation
```javascript
class DataCompressor {
  constructor() {
    this.compressionLevel = 6;
  }
  
  compress(data) {
    const jsonString = JSON.stringify(data);
    const compressed = pako.gzip(jsonString, { level: this.compressionLevel });
    return compressed;
  }
  
  decompress(compressed) {
    const decompressed = pako.ungzip(compressed);
    const jsonString = new TextDecoder().decode(decompressed);
    return JSON.parse(jsonString);
  }
  
  async compressAndStore(key, data) {
    const compressed = this.compress(data);
    const blob = new Blob([compressed], { type: 'application/gzip' });
    
    // Store in IndexedDB
    const db = await this.openDB();
    const transaction = db.transaction(['compressed_data'], 'readwrite');
    const store = transaction.objectStore('compressed_data');
    await store.put({ key, data: blob });
  }
}
```

## Monitoring and Profiling

### 1. Performance Monitoring

#### Real-time Monitoring
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Monitor FCP
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.set('FCP', entry.startTime);
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
    
    // Monitor LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}
```

#### Custom Metrics
```javascript
class CustomMetrics {
  constructor() {
    this.timers = new Map();
    this.counters = new Map();
  }
  
  startTimer(name) {
    this.timers.set(name, performance.now());
  }
  
  endTimer(name) {
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.timers.delete(name);
      return duration;
    }
    return null;
  }
  
  incrementCounter(name) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + 1);
  }
  
  getCounter(name) {
    return this.counters.get(name) || 0;
  }
}
```

### 2. Profiling Tools

#### Memory Profiling
```javascript
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
    this.interval = null;
  }
  
  startProfiling(interval = 5000) {
    this.interval = setInterval(() => {
      this.takeSnapshot();
    }, interval);
  }
  
  takeSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      memory: this.getMemoryInfo(),
      heap: this.getHeapInfo()
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only last 20 snapshots
    if (this.snapshots.length > 20) {
      this.snapshots.shift();
    }
  }
  
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
}
```

## Best Practices

### 1. Code Optimization
- **Minimize DOM Manipulation**: Batch DOM updates
- **Use Efficient Algorithms**: Choose appropriate data structures
- **Avoid Memory Leaks**: Clean up event listeners and references
- **Optimize Loops**: Use efficient iteration methods

### 2. Asset Optimization
- **Compress Images**: Use appropriate image formats and compression
- **Minify Code**: Remove unnecessary whitespace and comments
- **Use CDNs**: Serve static assets from CDNs
- **Enable Compression**: Use gzip compression for text assets

### 3. User Experience
- **Progressive Loading**: Load critical content first
- **Smooth Animations**: Use 60fps animations
- **Responsive Design**: Optimize for different screen sizes
- **Accessibility**: Ensure good performance for all users

---

This performance optimization guide provides comprehensive strategies for optimizing the GeoQuest application's performance, ensuring fast loading times, smooth interactions, and efficient resource usage.
