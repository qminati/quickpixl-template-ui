import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Minus, Settings as SettingsIcon, Copy as CopyIcon } from 'lucide-react';
import { TextInput, TypographySettings } from '@/types/interfaces';

interface TextEditorProps {
  onSubmitVariation: (texts: string[]) => void;
  lastSelectedFont?: string;
  typographySettings?: TypographySettings;
  onFocusInputTab?: (index: number) => void; // NEW
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  onSubmitVariation, 
  lastSelectedFont = 'Inter, sans-serif',
  typographySettings,
  onFocusInputTab = () => {} // NEW
}) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'bulk' | 'list'>('manual');
  const [textInputs, setTextInputs] = useState<TextInput[]>([
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' }
  ]);
  const [listInputs, setListInputs] = useState<TextInput[]>([
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' }
  ]);
  const [previewText, setPreviewText] = useState('Sample Text');
  const [previewBackgroundColor, setPreviewBackgroundColor] = useState('#000000');

  const addTextInput = () => {
    const newInput: TextInput = {
      id: crypto.randomUUID(),
      text: ''
    };
    setTextInputs(prev => [...prev, newInput]);
  };

  const removeTextInput = (id: string) => {
    if (textInputs.length > 1) {
      setTextInputs(prev => prev.filter(input => input.id !== id));
    }
  };

  const duplicateTextInput = (id: string) => {
    const inputToDuplicate = textInputs.find(input => input.id === id);
    if (inputToDuplicate) {
      const newInput: TextInput = {
        id: crypto.randomUUID(),
        text: inputToDuplicate.text // Copy the text content
      };
      setTextInputs(prev => {
        const index = prev.findIndex(input => input.id === id);
        // Insert the duplicate right after the original
        const newArray = [...prev.slice(0, index + 1), newInput, ...prev.slice(index + 1)];
        return newArray;
      });
    }
  };

  const updateTextInput = (id: string, text: string) => {
    setTextInputs(prev => {
      const next = prev.map(input => 
        input.id === id ? { ...input, text } : input
      );
      // Update preview with first non-empty text from updated array
      const firstText = next.find(input => input.text.trim())?.text || 'Sample Text';
      setPreviewText(firstText);
      return next;
    });
  };

  const addListInput = () => {
    const newInput: TextInput = {
      id: crypto.randomUUID(),
      text: ''
    };
    setListInputs(prev => [...prev, newInput]);
  };

  const removeListInput = (id: string) => {
    if (listInputs.length > 1) {
      setListInputs(prev => prev.filter(input => input.id !== id));
    }
  };

  const duplicateListInput = (id: string) => {
    const inputToDuplicate = listInputs.find(input => input.id === id);
    if (inputToDuplicate) {
      const newInput: TextInput = {
        id: crypto.randomUUID(),
        text: inputToDuplicate.text // Copy the text content
      };
      setListInputs(prev => {
        const index = prev.findIndex(input => input.id === id);
        // Insert the duplicate right after the original
        const newArray = [...prev.slice(0, index + 1), newInput, ...prev.slice(index + 1)];
        return newArray;
      });
    }
  };

  const updateListInput = (id: string, text: string) => {
    setListInputs(prev => {
      const next = prev.map(input => 
        input.id === id ? { ...input, text } : input
      );
      // Update preview with first non-empty text from updated array
      const firstText = next.find(input => input.text.trim())?.text || 'Sample Text';
      setPreviewText(firstText);
      return next;
    });
  };

  const handleSubmit = () => {
    let texts: string[] = [];
    
    if (activeMode === 'manual') {
      texts = textInputs.map(input => input.text).filter(text => text.trim());
    } else if (activeMode === 'list') {
      texts = listInputs.map(input => input.text).filter(text => text.trim());
    }
    
    onSubmitVariation(texts);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Preview Canvas */}
        <div className="bg-background border border-input rounded-lg mb-4" style={{ height: '300px' }}>
          {/* Top Toolbar with Text Input and Background Color Picker */}
          <div className="bg-muted/30 border-b border-input px-4 py-2 rounded-t-lg flex items-center justify-between">
            <Input
              placeholder="Edit Sample Text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-64 h-8 bg-background"
            />
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 px-2 text-xs border-panel-border hover:bg-secondary"
                  >
                    <div 
                      className="w-3 h-3 rounded mr-1 border border-panel-border" 
                      style={{ backgroundColor: previewBackgroundColor }}
                    />
                    Background
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={previewBackgroundColor}
                        onChange={(e) => setPreviewBackgroundColor(e.target.value)}
                        className="w-8 h-8 rounded border border-panel-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewBackgroundColor}
                        onChange={(e) => setPreviewBackgroundColor(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-background border border-panel-border rounded"
                        placeholder="#ffffff"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">Preview background color</div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-1">
                {[
                  { color: '#000000', name: 'Black' },
                  { color: '#ffffff', name: 'White' },
                  { color: '#6b7280', name: 'Grey' },
                  { color: '#ef4444', name: 'Red' },
                  { color: '#3b82f6', name: 'Blue' },
                  { color: '#10b981', name: 'Green' }
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setPreviewBackgroundColor(preset.color)}
                    className="w-5 h-5 rounded-full border border-panel-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Canvas Content */}
          <div 
            className="h-full flex items-center justify-center" 
            style={{ backgroundColor: previewBackgroundColor }}
          >
            <h1 
              className="text-4xl font-bold text-foreground"
              style={{ 
                fontFamily: lastSelectedFont,
                fontWeight: typographySettings?.bold ? 'bold' : 'normal',
                fontStyle: typographySettings?.italic ? 'italic' : 'normal',
                textDecoration: typographySettings?.underline ? 'underline' : 'none',
                textTransform: typographySettings?.textCase === 'normal' ? 'none' : (typographySettings?.textCase || 'none') as 'none' | 'uppercase' | 'lowercase',
                letterSpacing: typographySettings?.letterSpacing ? `${typographySettings.letterSpacing}px` : 'normal',
                wordSpacing: typographySettings?.wordSpacing ? `${typographySettings.wordSpacing}px` : 'normal',
                textAlign: (typographySettings?.textAlign || 'center') as 'left' | 'center' | 'right' | 'justify',
                WebkitTextStroke: typographySettings?.textStroke ? `${typographySettings.strokeWidth || 1}px ${typographySettings.strokeColor || '#000000'}` : 'none'
              }}
            >
              {previewText}
            </h1>
          </div>
        </div>

        {/* Text Input Mode Panel */}
        <div className="bg-card border border-input rounded-lg p-4 flex-1 flex flex-col">
          {/* Compact Mode Toggle Buttons */}
          <div className="flex items-center space-x-1 mb-4 flex-shrink-0">
            <span className="text-xs text-muted-foreground mr-2">Text Input Mode:</span>
            <Button
              variant={activeMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setActiveMode('manual')}
            >
              Manual Input
            </Button>
            <Button
              variant={activeMode === 'bulk' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setActiveMode('bulk')}
            >
              Bulk Text
            </Button>
            <Button
              variant={activeMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setActiveMode('list')}
            >
              Input List
            </Button>
          </div>

          {activeMode === 'manual' && (
            <div className="flex-1">
              {/* Manual Inputs Section */}
              <h3 className="text-sm font-medium text-foreground mb-3">Manual Inputs</h3>
              
              {/* Text Input Fields */}
              <div className="space-y-2 mb-4">
                {textInputs.map((input, index) => (
                  <div key={input.id} className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground min-w-[20px]">
                      {index + 1}.
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFocusInputTab(index)}
                      className="p-2 h-8 w-8"
                      title="Input settings"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type your text here..."
                      value={input.text}
                      onChange={(e) => updateTextInput(input.id, e.target.value)}
                      className="flex-1 bg-background"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateTextInput(input.id)}
                      className="p-2 h-8 w-8"
                      title="Duplicate input"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTextInput(input.id)}
                      disabled={textInputs.length <= 1}
                      className="p-2 h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTextInput}
                  className="p-2 h-8 w-8"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {activeMode === 'bulk' && (
            <div className="flex-1 flex flex-col min-h-[350px]">
              <h3 className="text-sm font-medium text-foreground mb-3 flex-shrink-0">Bulk Text Input</h3>
              
              {/* Textarea Container */}
              <div className="overflow-x-auto flex-1 min-h-[300px]">
                <textarea
                  placeholder="Enter multiple texts, one per line..."
                  className="w-full min-h-[360px] h-auto p-3 bg-background border border-input rounded-md resize-y"
                />
              </div>
            </div>
          )}

          {activeMode === 'list' && (
            <div className="flex-1 flex flex-col min-h-[350px]">
              <h3 className="text-sm font-medium text-foreground mb-3 flex-shrink-0">Input List</h3>
              
              {/* Horizontal Scrollable Input Fields */}
              <div className="overflow-x-auto flex-1 min-h-[300px]">
                <div className="flex space-x-3 h-full min-h-[300px]" style={{ minWidth: 'max-content' }}>
                  {listInputs.map((input, index) => (
                    <div key={input.id} className="flex flex-col space-y-2 min-w-[200px] h-full">
                      {/* Input Label */}
                      <div className="flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            Input {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFocusInputTab(index)}
                            className="p-1 h-6 w-6"
                            title="Input settings"
                          >
                            <SettingsIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateListInput(input.id)}
                            className="p-1 h-6 w-6"
                            title="Duplicate input"
                          >
                            <CopyIcon className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListInput(input.id)}
                          disabled={listInputs.length <= 1}
                          className="p-1 h-6 w-6"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {/* Tall Input Field */}
                      <textarea
                        placeholder="Type your text here..."
                        value={input.text}
                        onChange={(e) => updateListInput(input.id, e.target.value)}
                        className="flex-1 min-h-[250px] w-full p-3 bg-background border border-input rounded-md resize-y text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  ))}
                  
                  {/* Add Button Column */}
                  <div className="flex flex-col justify-start min-w-[50px] pt-8 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addListInput}
                      className="p-2 h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button Container - Fixed at Bottom */}
      <div className="border-t border-input bg-card p-4">
        <Button 
          onClick={handleSubmit}
          className="w-full py-3 font-medium"
        >
          Submit Variation
        </Button>
      </div>
    </div>
  );
};

export default TextEditor;