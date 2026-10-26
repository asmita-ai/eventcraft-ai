import { useState, useCallback } from 'react';
import { getStoredApiKey } from '../services/gemini';

/**
 * Custom Hook for Modal Dialog State & Visibility
 * Handles clean toggles and focus state management.
 */
export function useModalState() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isJudgeGuideOpen, setIsJudgeGuideOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => Boolean(getStoredApiKey()));

  const openApiKeyModal = useCallback(() => setIsApiKeyModalOpen(true), []);
  const closeApiKeyModal = useCallback(() => setIsApiKeyModalOpen(false), []);

  const openJudgeGuide = useCallback(() => setIsJudgeGuideOpen(true), []);
  const closeJudgeGuide = useCallback(() => setIsJudgeGuideOpen(false), []);

  const openWizard = useCallback(() => setIsWizardOpen(true), []);
  const closeWizard = useCallback(() => setIsWizardOpen(false), []);

  const handleKeySaved = useCallback((hasKey: boolean) => {
    setHasApiKey(hasKey);
  }, []);

  return {
    isApiKeyModalOpen,
    openApiKeyModal,
    closeApiKeyModal,
    isJudgeGuideOpen,
    openJudgeGuide,
    closeJudgeGuide,
    isWizardOpen,
    openWizard,
    closeWizard,
    hasApiKey,
    handleKeySaved,
  };
}
