// src/hooks/useAutoRefresh.ts - Universal Auto-Refresh Hook
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshOptions {
  refreshInterval?: number; // milliseconds (default: 30000 = 30 seconds)
  enabled?: boolean; // whether auto-refresh is enabled (default: true)
  onRefresh: () => Promise<void> | void; // callback function to execute on refresh
  onError?: (error: Error) => void; // optional error handler
}

export function useAutoRefresh({
  refreshInterval = 30000, // 30 seconds default
  enabled = true,
  onRefresh,
  onError,
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('⏭️ Skipping refresh - already in progress');
      return;
    }

    try {
      isRefreshingRef.current = true;
      console.log('🔄 Auto-refreshing data...');
      await onRefresh();
      console.log('✅ Auto-refresh completed');
    } catch (error) {
      console.error('❌ Auto-refresh error:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefresh, onError]);

  useEffect(() => {
    if (!enabled || refreshInterval <= 0) {
      console.log('⏸️ Auto-refresh disabled');
      return;
    }

    console.log(`⏰ Auto-refresh enabled (interval: ${refreshInterval}ms)`);

    // Set up interval
    intervalRef.current = setInterval(refresh, refreshInterval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        console.log('🛑 Stopping auto-refresh');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Return manual refresh function
  return { refresh };
}