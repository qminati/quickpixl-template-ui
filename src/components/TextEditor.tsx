import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';

interface TextInput {
  id: string;
  text: string;
}

interface TextEditorProps {
  onSubmitVariation: (texts: string[]) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ onSubmitVariation }) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'bulk' | 'list'>('manual');
  const [textInputs, setTextInputs] = useState<TextInput[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' }
  ]);
  const [previewText, setPreviewText] = useState('Sample Text');

  const addTextInput = () => {
    const newInput: TextInput = {
      id: String(textInputs.length + 1),
      text: ''
    };
    setTextInputs([...textInputs, newInput]);
  };

  const removeTextInput = (id: string) => {
    if (textInputs.length > 1) {
      setTextInputs(textInputs.filter(input => input.id !== id));
    }
  };

  const updateTextInput = (id: string, text: string) => {
    setTextInputs(textInputs.map(input => 
      input.id === id ? { ...input, text } : input
    ));
    
    // Update preview with first non-empty text or sample text
    const firstText = textInputs.find(input => input.text.trim())?.text || 'Sample Text';
    setPreviewText(firstText);
  };

  const handleSubmit = () => {
    const texts = textInputs.map(input => input.text).filter(text => text.trim());
    onSubmitVariation(texts);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Preview Canvas */}
        <div className="bg-background border border-input rounded-lg mb-4" style={{ height: '300px' }}>
          {/* Top Toolbar with Text Input */}
          <div className="bg-muted/30 border-b border-input px-4 py-2 rounded-t-lg">
            <Input
              placeholder="Edit Sample Text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-64 h-8 bg-background"
            />
          </div>
          
          {/* Canvas Content */}
          <div className="h-full flex items-center justify-center bg-muted/10">
            <h1 className="text-4xl font-bold text-foreground">
              {previewText}
            </h1>
          </div>
        </div>

        {/* Text Input Mode Panel */}
        <div className="bg-card border border-input rounded-lg p-4">
          {/* Compact Mode Toggle Buttons */}
          <div className="flex items-center space-x-1 mb-4">
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
            <div>
              {/* Manual Inputs Section */}
              <h3 className="text-sm font-medium text-foreground mb-3">Manual Inputs</h3>
              
              {/* Text Input Fields */}
              <div className="space-y-2 mb-4">
                {textInputs.map((input, index) => (
                  <div key={input.id} className="flex items-center space-x-3">
                    <span className="text-sm text-muted-foreground min-w-[20px]">
                      {index + 1}.
                    </span>
                    <Input
                      placeholder="Type your text here..."
                      value={input.text}
                      onChange={(e) => updateTextInput(input.id, e.target.value)}
                      className="flex-1 bg-background"
                    />
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
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Bulk Text Input</h3>
              <textarea
                placeholder="Enter multiple texts, one per line..."
                className="w-full h-32 p-3 bg-background border border-input rounded-md resize-none"
              />
            </div>
          )}

          {activeMode === 'list' && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Input List</h3>
              <div className="text-sm text-muted-foreground">
                Upload a CSV or TXT file with text variations
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