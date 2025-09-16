// Performance optimization utilities

// Debounce function for search and typing
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Image lazy loading utility
export function createImageLoader() {
  const imageCache = new Map<string, boolean>()
  
  return {
    preloadImage: (src: string): Promise<void> => {
      if (imageCache.has(src)) {
        return Promise.resolve()
      }
      
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          imageCache.set(src, true)
          resolve()
        }
        img.onerror = reject
        img.src = src
      })
    },
    
    isImageCached: (src: string): boolean => {
      return imageCache.has(src)
    }
  }
}

// Virtual scrolling for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
  const totalHeight = items.length * itemHeight
  
  return {
    getVisibleItems: (scrollTop: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight)
      const endIndex = Math.min(startIndex + visibleCount, items.length)
      
      return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        offsetY: startIndex * itemHeight,
        totalHeight
      }
    }
  }
}

// Memory management for large datasets
export class DataManager<T> {
  private cache = new Map<string, T>()
  private maxSize: number
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }
  
  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }
  
  get(key: string): T | undefined {
    return this.cache.get(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
}
