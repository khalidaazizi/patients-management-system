// hooks/useLoading.ts
import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback((text?: string) => {
    setIsLoading(true);
    if (text) setLoadingText(text);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText('Loading...');
    setProgress(0);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  return {
    isLoading,
    loadingText,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    setLoadingText,
  };
};