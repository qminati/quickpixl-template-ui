import React, { useState, useCallback } from 'react';
import { 
  Save, 
  Copy, 
  Trash2, 
  Plus, 
  X, 
  GripVertical, 
  Edit3, 
  Undo,
  Redo,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Variation, 
  TemplateVariation, 
  FontVariation, 
  TypographyVariation, 
  TextShapeVariation, 
  RotateFlipVariation, 
  ColorFillVariation,
  StrokesVariation
} from '@/types/interfaces';

type AnyVariation = Variation | TemplateVariation | FontVariation | TypographyVariation | 
  TextShapeVariation | RotateFlipVariation | ColorFillVariation | StrokesVariation;

interface VariationDetailViewProps {
  variation: AnyVariation | null;
  variationType: string;
  onSave: (variation: AnyVariation) => void;
  onDelete: (variationId: string) => void;
  onDuplicate: (variation: AnyVariation) => void;
  hasUnsavedChanges: boolean;
  onDiscardChanges: () => void;
}

const VariationDetailView: React.FC<VariationDetailViewProps> = ({
  variation,
  variationType,
  onSave,
  onDelete,
  onDuplicate,
  hasUnsavedChanges,
  onDiscardChanges
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedElements, setSelectedElements] = useState<Set<number>>(new Set());

  const handleSave = () => {
    if (variation) {
      onSave(variation);
      setIsEditing(false);
      toast.success('Variation saved successfully');
    }
  };

  const handleDelete = () => {
    if (variation) {
      onDelete(variation.id);
      toast.success('Variation deleted');
    }
  };

  const handleDuplicate = () => {
    if (variation) {
      onDuplicate(variation);
      toast.success('Variation duplicated');
    }
  };

  const toggleElementSelection = (index: number) => {
    const newSelection = new Set(selectedElements);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedElements(newSelection);
  };

  const deleteSelectedElements = () => {
    // Implementation for bulk delete
    toast.success(`Deleted ${selectedElements.size} elements`);
    setSelectedElements(new Set());
  };

  if (!variation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a variation to view details</h3>
          <p className="text-muted-foreground">
            Choose a variation from the left panel to view and edit its details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-semibold">{variationType} Variation</h2>
              <p className="text-sm text-muted-foreground">ID: {variation.id}</p>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="animate-pulse">
                <Edit3 className="w-3 h-3 mr-1" />
                Editing
              </Badge>
            )}
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'View Mode' : 'Edit Mode'}
            </Button>
            
            {isEditing && (
              <>
                <Button variant="outline" size="sm" disabled>
                  <Undo className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Redo className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            
            {hasUnsavedChanges && (
              <Button variant="outline" size="sm" onClick={onDiscardChanges}>
                Discard Changes
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            {isEditing ? (
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={variation.description}
                onChange={(e) => {
                  // Update description logic here
                }}
                placeholder="Enter variation description..."
              />
            ) : (
              <p className="text-muted-foreground">
                {variation.description || 'No description provided'}
              </p>
            )}
          </Card>

          {/* Variation Content based on type */}
          {renderVariationContent(variation, variationType, isEditing, selectedElements, toggleElementSelection)}

          {/* Bulk Actions */}
          {isEditing && selectedElements.size > 0 && (
            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedElements.size} element{selectedElements.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedElements(new Set())}>
                    Clear Selection
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteSelectedElements}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Metadata */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">Just now</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last modified:</span>
                <span className="ml-2">Just now</span>
              </div>
              <div>
                <span className="text-muted-foreground">Elements:</span>
                <span className="ml-2">{getElementCount(variation, variationType)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2">{variationType}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function to render different variation content
const renderVariationContent = (
  variation: AnyVariation, 
  variationType: string, 
  isEditing: boolean,
  selectedElements: Set<number>,
  toggleElementSelection: (index: number) => void
) => {
  switch (variationType) {
    case 'Background':
      return renderBackgroundVariation(variation as Variation, isEditing, selectedElements, toggleElementSelection);
    case 'Template':
      return renderTemplateVariation(variation as TemplateVariation, isEditing, selectedElements, toggleElementSelection);
    case 'Font':
      return renderFontVariation(variation as FontVariation, isEditing, selectedElements, toggleElementSelection);
    case 'Typography':
      return renderTypographyVariation(variation as TypographyVariation, isEditing);
    case 'Text Shape':
      return renderTextShapeVariation(variation as TextShapeVariation, isEditing);
    case 'Rotate & Flip':
      return renderRotateFlipVariation(variation as RotateFlipVariation, isEditing);
    case 'Color Fill':
      return renderColorFillVariation(variation as ColorFillVariation, isEditing);
    default:
      return <div>Unknown variation type</div>;
  }
};

// Individual variation renderers
const renderBackgroundVariation = (
  variation: Variation, 
  isEditing: boolean, 
  selectedElements: Set<number>,
  toggleElementSelection: (index: number) => void
) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Colors & Images</h3>
      {isEditing && (
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Element
        </Button>
      )}
    </div>
    
    <div className="grid grid-cols-6 gap-4">
      {variation.colors.map((color, index) => (
        <div 
          key={index}
          className={`group relative aspect-square rounded-lg cursor-pointer transition-all
            ${selectedElements.has(index) ? 'ring-2 ring-primary' : ''}
            ${isEditing ? 'hover:ring-2 hover:ring-muted-foreground' : ''}
          `}
          style={{ backgroundColor: color }}
          onClick={() => isEditing && toggleElementSelection(index)}
        >
          {isEditing && (
            <>
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3 text-white drop-shadow" />
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <input
                type="checkbox"
                className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
                checked={selectedElements.has(index)}
                onChange={() => toggleElementSelection(index)}
              />
            </>
          )}
        </div>
      ))}
      
      {variation.images.map((image, index) => (
        <div 
          key={`img-${index}`}
          className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all
            ${selectedElements.has(variation.colors.length + index) ? 'ring-2 ring-primary' : ''}
            ${isEditing ? 'hover:ring-2 hover:ring-muted-foreground' : ''}
          `}
          onClick={() => isEditing && toggleElementSelection(variation.colors.length + index)}
        >
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Image {index + 1}</span>
          </div>
          {isEditing && (
            <>
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3 text-white drop-shadow" />
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  </Card>
);

const renderTemplateVariation = (
  variation: TemplateVariation, 
  isEditing: boolean,
  selectedElements: Set<number>,
  toggleElementSelection: (index: number) => void
) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Templates</h3>
      {isEditing && (
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      )}
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      {variation.templates.map((template, index) => (
        <div 
          key={template.id}
          className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all
            ${selectedElements.has(index) ? 'ring-2 ring-primary' : ''}
            ${isEditing ? 'hover:ring-2 hover:ring-muted-foreground' : ''}
          `}
          onClick={() => isEditing && toggleElementSelection(index)}
        >
          <img 
            src={template.image} 
            alt={template.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-xs font-medium">{template.title}</p>
            <p className="text-white/70 text-xs">{template.size}</p>
          </div>
          {isEditing && (
            <>
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white drop-shadow" />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  </Card>
);

const renderFontVariation = (
  variation: FontVariation, 
  isEditing: boolean,
  selectedElements: Set<number>,
  toggleElementSelection: (index: number) => void
) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Fonts</h3>
      {isEditing && (
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Font
        </Button>
      )}
    </div>
    
    <div className="space-y-3">
      {variation.fonts.map((font, index) => (
        <div 
          key={index}
          className={`group relative p-4 border rounded-lg cursor-pointer transition-all
            ${selectedElements.has(index) ? 'ring-2 ring-primary' : ''}
            ${isEditing ? 'hover:ring-2 hover:ring-muted-foreground' : ''}
          `}
          onClick={() => isEditing && toggleElementSelection(index)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ fontFamily: font }}>
                {font}
              </p>
              <p className="text-2xl mt-1" style={{ fontFamily: font }}>
                The quick brown fox jumps
              </p>
            </div>
            {isEditing && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <button className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const renderTypographyVariation = (variation: TypographyVariation, isEditing: boolean) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Typography Settings</h3>
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <h4 
          className="text-2xl mb-2"
          style={{
            fontWeight: variation.settings.bold ? 'bold' : 'normal',
            fontStyle: variation.settings.italic ? 'italic' : 'normal',
            textDecoration: variation.settings.underline ? 'underline' : 'none',
            textTransform: variation.settings.textCase as any,
            letterSpacing: `${variation.settings.letterSpacing}px`,
            wordSpacing: `${variation.settings.wordSpacing}px`,
            textAlign: variation.settings.textAlign as any,
          }}
        >
          Sample Text Preview
        </h4>
        <p className="text-sm text-muted-foreground">
          This preview shows how the typography settings will be applied
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Bold:</strong> {variation.settings.bold ? 'Yes' : 'No'}</div>
        <div><strong>Italic:</strong> {variation.settings.italic ? 'Yes' : 'No'}</div>
        <div><strong>Underline:</strong> {variation.settings.underline ? 'Yes' : 'No'}</div>
        <div><strong>Text Case:</strong> {variation.settings.textCase}</div>
        <div><strong>Letter Spacing:</strong> {variation.settings.letterSpacing}px</div>
        <div><strong>Word Spacing:</strong> {variation.settings.wordSpacing}px</div>
        <div><strong>Text Align:</strong> {variation.settings.textAlign}</div>
        <div><strong>Text Stroke:</strong> {variation.settings.textStroke ? 'Yes' : 'No'}</div>
      </div>
    </div>
  </Card>
);

const renderTextShapeVariation = (variation: TextShapeVariation, isEditing: boolean) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Text Shape: {variation.shape}</h3>
    <div className="space-y-4">
      <div className="p-8 border rounded-lg bg-muted/50 text-center">
        <div className="text-4xl font-bold mb-2">
          SAMPLE TEXT
        </div>
        <p className="text-sm text-muted-foreground">
          Preview of text with {variation.shape} shape applied
        </p>
      </div>
      
      <div className="text-sm">
        <strong>Shape:</strong> {variation.shape}
        <br />
        <strong>Settings:</strong> {JSON.stringify(variation.settings)}
      </div>
    </div>
  </Card>
);

const renderRotateFlipVariation = (variation: RotateFlipVariation, isEditing: boolean) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Rotate & Flip Settings</h3>
    <div className="space-y-4">
      <div className="p-8 border rounded-lg bg-muted/50 text-center">
        <div 
          className="inline-block text-4xl font-bold transition-transform"
          style={{
            transform: `
              rotate(${variation.settings.rotation}deg) 
              scaleX(${variation.settings.flipHorizontal ? -1 : 1}) 
              scaleY(${variation.settings.flipVertical ? -1 : 1})
            `
          }}
        >
          SAMPLE
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div><strong>Rotation:</strong> {variation.settings.rotation}°</div>
        <div><strong>Flip Horizontal:</strong> {variation.settings.flipHorizontal ? 'Yes' : 'No'}</div>
        <div><strong>Flip Vertical:</strong> {variation.settings.flipVertical ? 'Yes' : 'No'}</div>
      </div>
    </div>
  </Card>
);

const renderColorFillVariation = (variation: ColorFillVariation, isEditing: boolean) => (
  <Card className="p-6">
    <h3 className="text-lg font-semibold mb-4">Color Fill: {variation.settings.mode}</h3>
    <div className="space-y-4">
      <div className="p-8 border rounded-lg bg-muted/50">
        {variation.settings.mode === 'solid' && (
          <div 
            className="w-full h-20 rounded"
            style={{ backgroundColor: variation.settings.solid.color }}
          />
        )}
        {variation.settings.mode === 'gradient' && (
          <div className="w-full h-20 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
        )}
        {variation.settings.mode === 'palette' && (
          <div className="grid grid-cols-5 gap-2">
            {variation.settings.palette.colors.map((color, index) => (
              <div 
                key={index}
                className="aspect-square rounded"
                style={{ backgroundColor: typeof color.value === 'string' ? color.value : '#ccc' }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="text-sm">
        <strong>Mode:</strong> {variation.settings.mode}
      </div>
    </div>
  </Card>
);

// Helper function to get element count
const getElementCount = (variation: AnyVariation, variationType: string): number => {
  switch (variationType) {
    case 'Background':
      const bgVar = variation as Variation;
      return bgVar.colors.length + bgVar.images.length;
    case 'Template':
      return (variation as TemplateVariation).templates.length;
    case 'Font':
      return (variation as FontVariation).fonts.length;
    case 'Typography':
    case 'Text Shape':
    case 'Rotate & Flip':
    case 'Color Fill':
      return 1; // These have single configurations
    default:
      return 0;
  }
};

export default VariationDetailView;