import { useState, useCallback, useMemo } from 'react';

export interface TabSettingsState {
  global: Record<string, any>;
  inputs: Record<string, Record<string, any>>;
}

export interface UseTabSettingsReturn {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  tabs: string[];
  addTab: (inputNumber?: number) => void;
  removeTab: (tabId: string) => void;
  getSettings: <T>(key: string, defaultValue: T) => T;
  setSettings: <T>(key: string, value: T) => void;
  hasCustomSettings: (tabId: string) => boolean;
  clearTabSettings: (tabId: string) => void;
  syncWithInputs: (inputCount: number) => void;
  duplicateTabSettings: (fromTab: string, toTab: string) => void;
}

const useTabSettings = (initialInputCount: number = 1): UseTabSettingsReturn => {
  const [currentTab, setCurrentTab] = useState<string>('GLOBAL');
  const [tabSettings, setTabSettings] = useState<TabSettingsState>({
    global: {},
    inputs: {}
  });

  // Generate tabs based on input count
  const tabs = useMemo(() => {
    const inputTabs = Array.from({ length: Math.max(initialInputCount, 1) }, (_, i) => `TI${i + 1}`);
    return ['GLOBAL', ...inputTabs];
  }, [initialInputCount]);

  const addTab = useCallback((inputNumber?: number) => {
    if (inputNumber) {
      // Tab will be created automatically by tabs memo
      return;
    }
  }, []);

  const removeTab = useCallback((tabId: string) => {
    if (tabId === 'GLOBAL') return; // Can't remove global tab
    
    setTabSettings(prev => {
      const newInputs = { ...prev.inputs };
      delete newInputs[tabId];
      return {
        ...prev,
        inputs: newInputs
      };
    });

    // Switch to GLOBAL if removing current tab
    if (currentTab === tabId) {
      setCurrentTab('GLOBAL');
    }
  }, [currentTab]);

  const getSettings = useCallback(<T,>(key: string, defaultValue: T): T => {
    if (currentTab === 'GLOBAL') {
      return (tabSettings.global[key] as T) ?? defaultValue;
    }

    // For input tabs, merge global settings with input-specific settings
    const globalValue = tabSettings.global[key] as T;
    const inputValue = tabSettings.inputs[currentTab]?.[key] as T;
    
    // Input settings override global settings
    if (inputValue !== undefined) {
      return inputValue;
    }
    
    return globalValue ?? defaultValue;
  }, [currentTab, tabSettings]);

  const setSettings = useCallback(<T,>(key: string, value: T) => {
    if (currentTab === 'GLOBAL') {
      setTabSettings(prev => ({
        ...prev,
        global: {
          ...prev.global,
          [key]: value
        }
      }));
    } else {
      setTabSettings(prev => ({
        ...prev,
        inputs: {
          ...prev.inputs,
          [currentTab]: {
            ...prev.inputs[currentTab],
            [key]: value
          }
        }
      }));
    }
  }, [currentTab]);

  const hasCustomSettings = useCallback((tabId: string): boolean => {
    if (tabId === 'GLOBAL') {
      return Object.keys(tabSettings.global).length > 0;
    }
    return Object.keys(tabSettings.inputs[tabId] || {}).length > 0;
  }, [tabSettings]);

  const clearTabSettings = useCallback((tabId: string) => {
    if (tabId === 'GLOBAL') {
      setTabSettings(prev => ({ ...prev, global: {} }));
    } else {
      setTabSettings(prev => {
        const newInputs = { ...prev.inputs };
        delete newInputs[tabId];
        return { ...prev, inputs: newInputs };
      });
    }
  }, []);

  const syncWithInputs = useCallback((inputCount: number) => {
    // Remove tabs for inputs that no longer exist
    setTabSettings(prev => {
      const newInputs = { ...prev.inputs };
      Object.keys(newInputs).forEach(tabId => {
        const inputNumber = parseInt(tabId.replace('TI', ''));
        if (inputNumber > inputCount) {
          delete newInputs[tabId];
        }
      });

      return {
        ...prev,
        inputs: newInputs
      };
    });

    // Switch to GLOBAL if current tab no longer exists
    const currentInputNumber = parseInt(currentTab.replace('TI', ''));
    if (currentTab !== 'GLOBAL' && currentInputNumber > inputCount) {
      setCurrentTab('GLOBAL');
    }
  }, [currentTab]);

  const duplicateTabSettings = useCallback((fromTab: string, toTab: string) => {
    if (fromTab === 'GLOBAL') {
      // Copy global settings to input tab
      setTabSettings(prev => ({
        ...prev,
        inputs: {
          ...prev.inputs,
          [toTab]: { ...prev.global }
        }
      }));
    } else if (toTab === 'GLOBAL') {
      // Don't copy to global tab
      return;
    } else {
      // Copy from one input tab to another
      const sourceSettings = tabSettings.inputs[fromTab] || {};
      setTabSettings(prev => ({
        ...prev,
        inputs: {
          ...prev.inputs,
          [toTab]: { ...sourceSettings }
        }
      }));
    }
  }, [tabSettings]);

  return {
    currentTab,
    setCurrentTab,
    tabs,
    addTab,
    removeTab,
    getSettings,
    setSettings,
    hasCustomSettings,
    clearTabSettings,
    syncWithInputs,
    duplicateTabSettings
  };
};

export default useTabSettings;