import React, { useState } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronRight, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FIELD_TYPES, BUTTON_VARIANTS, BUTTON_SIZES } from '@/utils/constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MetadataDialog from './MetadataDialog';

const FieldComponent = ({ field, addField, updateField, removeField, nestLevel = 0, parentType, selectedField, toggleSelectField }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);

  const isSelected = selectedField?.id === field.id;

  const renderFieldContent = () => {
    switch (field.type) {
      case 'enum':
        return (
          <div className="mt-2">
            <Input
              value={field.enums.join(', ')}
              onChange={(e) => updateField(field.id, 'enums', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Enter enum values (comma-separated)"
            />
          </div>
        );
      case 'annotated':
      case 'model':
      case 'list':
      case 'set':
        return (
          <div className="mt-2">
            {field.fields && field.fields.map(subField => (
              <FieldComponent
                key={subField.id}
                field={subField}
                addField={addField}
                updateField={updateField}
                removeField={removeField}
                nestLevel={nestLevel + 1}
                parentType={field.type}
                selectedField={selectedField}
                toggleSelectField={toggleSelectField}
              />
            ))}
            <Button
              onClick={() => addField(field.id)}
              size={BUTTON_SIZES.SM}
              className="mt-2"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {field.type === 'annotated' || field.type === 'list' || field.type === 'set'
                ? 'Add Item Type'
                : 'Add Field'}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`mb-4 p-4 border rounded ${nestLevel > 0 ? 'ml-4' : ''} ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
      <div className="flex items-center mb-2">
        {(field.type === 'annotated' || field.type === 'model' || field.type === 'list' || field.type === 'set') && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant={BUTTON_VARIANTS.GHOST}
            size={BUTTON_SIZES.ICON}
            className="mr-2"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        {(!['annotated', 'list', 'set'].includes(parentType) || field.type === 'model') && (
          <Input
            value={field.name}
            onChange={(e) => updateField(field.id, 'name', e.target.value)}
            placeholder="Field name"
            className="w-1/4 mr-2"
          />
        )}
        <Select
          value={field.type}
          onValueChange={(value) => updateField(field.id, 'type', value)}
        >
          <SelectTrigger className="w-1/4 mr-2">
            <SelectValue placeholder="Select field type" />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!['annotated', 'list', 'set'].includes(parentType) && (
          <div className="flex items-center space-x-2 mr-2">
            <Switch
              checked={field.optional}
              onCheckedChange={(checked) => updateField(field.id, 'optional', checked)}
            />
            <span>Optional</span>
          </div>
        )}
        <Button
          id={`field-select-button-${field.id}`}
          onClick={() => toggleSelectField(field)}
          variant={isSelected ? BUTTON_VARIANTS.DEFAULT : BUTTON_VARIANTS.OUTLINE}
          size={BUTTON_SIZES.SM}
          className={`mr-2 ${isSelected ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
        >
          {isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            'Select'
          )}
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setIsMetadataDialogOpen(true)} variant={BUTTON_VARIANTS.OUTLINE} size={BUTTON_SIZES.SM} className="mr-2">
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit metadata</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => removeField(field.id)} variant={BUTTON_VARIANTS.DESTRUCTIVE} size={BUTTON_SIZES.SM}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete field</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {isExpanded && renderFieldContent()}
      <MetadataDialog
        isOpen={isMetadataDialogOpen}
        onClose={() => setIsMetadataDialogOpen(false)}
        field={field}
        updateField={updateField}
      />
    </div>
  );
};

export default FieldComponent;