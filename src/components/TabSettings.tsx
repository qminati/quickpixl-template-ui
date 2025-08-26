import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TabSettingsState {
  global: Record<string, any>;
  inputs: Record<string, Record<string, any>>;
}

interface TabSettingsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  tabs: string[];
  onAddTab: () => void;
  onRemoveTab: (tabId: string) => void;
  hasCustomSettings: (tabId: string) => boolean;
}

const TabSettings: React.FC<TabSettingsProps> = ({
  currentTab,
  onTabChange,
  tabs,
  onAddTab,
  onRemoveTab,
  hasCustomSettings
}) => {
  return (
    <div className="bg-card border-b border-panel-border">
      <div className="flex items-center px-4 py-2 space-x-1 overflow-x-auto">
        {/* Global Tab */}
        <Button
          variant={currentTab === 'GLOBAL' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('GLOBAL')}
          className={cn(
            "h-8 px-3 text-xs whitespace-nowrap relative",
            currentTab === 'GLOBAL' && "bg-primary text-primary-foreground"
          )}
        >
          GLOBAL
          {hasCustomSettings('GLOBAL') && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
          )}
        </Button>

        {/* Input Tabs */}
        {tabs.filter(tab => tab !== 'GLOBAL').map((tab) => (
          <Button
            key={tab}
            variant={currentTab === tab ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab)}
            className={cn(
              "h-8 px-3 text-xs whitespace-nowrap relative",
              currentTab === tab && "bg-primary text-primary-foreground"
            )}
          >
            {tab}
            {hasCustomSettings(tab) && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
            )}
          </Button>
        ))}

        {/* Add Tab Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTab}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TabSettings;