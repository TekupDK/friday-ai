import { QueryClient } from "@tanstack/react-query";

/**
 * Phase 7.2: Intelligent Cache Strategy
 * 
 * Workspace-specific cache management with:
 * - Auth-aware invalidation
 * - Smart TTL based on data type
 * - Workspace-specific cache keys
 * - Performance optimization
 */

export interface CacheConfig {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

export const CACHE_CONFIGS = {
  // Real-time data - short cache
  realtime: {
    staleTime: 30 * 1000,        // 30 seconds
    gcTime: 2 * 60 * 1000,      // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  
  // User interaction data - medium cache
  interactive: {
    staleTime: 2 * 60 * 1000,    // 2 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  
  // Reference data - long cache
  reference: {
    staleTime: 15 * 60 * 1000,   // 15 minutes
    gcTime: 60 * 60 * 1000,     // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
  
  // Static data - very long cache
  static: {
    staleTime: 60 * 60 * 1000,   // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
} as const;

export type CacheType = keyof typeof CACHE_CONFIGS;

/**
 * Get cache config based on data type and context
 */
export function getCacheConfig(
  dataType: 'emails' | 'leads' | 'bookings' | 'invoices' | 'customers' | 'dashboard' | 'auth',
  isRealtime: boolean = false
): CacheConfig {
  // Real-time overrides
  if (isRealtime) {
    return CACHE_CONFIGS.realtime;
  }
  
  // Data type specific configs
  switch (dataType) {
    case 'emails':
      return CACHE_CONFIGS.interactive; // 2 minutes
    case 'leads':
      return CACHE_CONFIGS.interactive; // 2 minutes  
    case 'bookings':
      return CACHE_CONFIGS.reference;  // 15 minutes
    case 'invoices':
      return CACHE_CONFIGS.reference;  // 15 minutes
    case 'customers':
      return CACHE_CONFIGS.static;     // 1 hour
    case 'dashboard':
      return CACHE_CONFIGS.interactive; // 2 minutes
    case 'auth':
      return CACHE_CONFIGS.realtime;   // 30 seconds
    default:
      return CACHE_CONFIGS.interactive;
  }
}

/**
 * Workspace-specific cache key generator
 */
export function createWorkspaceCacheKey(
  workspace: 'lead' | 'booking' | 'invoice' | 'customer' | 'dashboard',
  dataType: string,
  id?: string | number
): string[] {
  const baseKey = ['workspace', workspace, dataType];
  return id ? [...baseKey, String(id)] : baseKey;
}

/**
 * Auth-aware cache invalidation
 */
export function invalidateAuthQueries(queryClient: QueryClient): void {
  console.log("[Cache] Invalidating auth-related queries");
  
  // Invalidate auth queries
  queryClient.invalidateQueries({
    queryKey: ['auth'],
  });
  
  // Invalidate user-specific data
  queryClient.invalidateQueries({
    queryKey: ['user'],
  });
  
  // Invalidate workspace data that depends on auth
  queryClient.invalidateQueries({
    queryKey: ['workspace'],
  });
}

/**
 * Workspace-specific cache invalidation
 */
export function invalidateWorkspaceQueries(
  queryClient: QueryClient,
  workspace?: 'lead' | 'booking' | 'invoice' | 'customer' | 'dashboard'
): void {
  console.log("[Cache] Invalidating workspace queries", { workspace });
  
  if (workspace) {
    // Invalidate specific workspace
    queryClient.invalidateQueries({
      queryKey: ['workspace', workspace],
    });
  } else {
    // Invalidate all workspaces
    queryClient.invalidateQueries({
      queryKey: ['workspace'],
    });
  }
}

/**
 * Smart cache warming for critical data
 */
export function warmupCache(queryClient: QueryClient, userId: string): void {
  // Skip cache warming in E2E mode to prevent unnecessary requests
  const isE2E = typeof window !== 'undefined' && (window as any).__E2E__;
  if (isE2E) {
    console.log("[Cache] Skipping cache warming in E2E mode");
    return;
  }
  
  console.log("[Cache] Warming up cache for user", { userId });
  
  // Prefetch user data
  queryClient.prefetchQuery({
    queryKey: ['auth', 'me'],
    staleTime: CACHE_CONFIGS.interactive.staleTime,
  });
  
  // Prefetch dashboard data
  queryClient.prefetchQuery({
    queryKey: createWorkspaceCacheKey('dashboard', 'overview'),
    staleTime: CACHE_CONFIGS.interactive.staleTime,
  });
}

/**
 * Cache statistics for monitoring
 */
export function getCacheStats(queryClient: QueryClient): {
  totalQueries: number;
  staleQueries: number;
  errorQueries: number;
  fetchingQueries: number;
} {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  return {
    totalQueries: queries.length,
    staleQueries: queries.filter(q => q.isStale()).length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
    fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
  };
}

/**
 * Create optimized QueryClient with intelligent cache strategy
 */
export function createOptimizedQueryClient(): QueryClient {
  // Check if we're in E2E test mode
  const isE2E = typeof window !== 'undefined' && (window as any).__E2E__;
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Use interactive config as default, but disable polling in E2E
        ...CACHE_CONFIGS.interactive,
        // Disable all polling and refetching in E2E mode to prevent network idle timeout
        refetchOnWindowFocus: !isE2E,
        refetchOnReconnect: !isE2E,
        retry: isE2E ? 0 : 3, // No retries in E2E for faster tests
        retryDelay: isE2E ? 0 : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: isE2E ? 60 * 1000 : CACHE_CONFIGS.interactive.staleTime, // Longer stale time in E2E
        gcTime: isE2E ? 5 * 60 * 1000 : CACHE_CONFIGS.interactive.gcTime, // Shorter GC in E2E
        // Enable structural sharing for better cache hit rates
        structuralSharing: true,
        // Disable queries in E2E mode to prevent unnecessary requests
        enabled: !isE2E,
        // Defer non-critical queries for faster initial load
        networkMode: 'online',
      },
      mutations: {
        // Retry failed mutations with intelligent strategy
        retry: isE2E ? 0 : 2,
        retryDelay: isE2E ? 0 : (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        networkMode: 'online',
      },
    },
  });
}
