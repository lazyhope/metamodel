import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { TYPE_CONSTRAINTS } from '@/utils/constants';

const renderConstraint = (constraint, field, handleInputChange) => {
  const commonProps = {
    id: constraint,
    className: "col-span-5",
    value: field[constraint] ?? null,
  };

  if (constraint === 'allow_inf_nan') {
    return <Switch
      {...commonProps}
      checked={field[constraint] ?? null}
      onCheckedChange={(checked) => handleInputChange(constraint, checked)}
    />;
  }

  if (['min_length', 'max_length', 'max_digits', 'decimal_places'].includes(constraint)) {
    return <Input
      {...commonProps}
      type="number"
      min={0}
      step={1}
      onChange={(e) => handleInputChange(constraint, e.target.value ? parseInt(e.target.value, 10) : null)}
    />;
  }

  if (constraint === 'multiple_of') {
    return <Input
      {...commonProps}
      type="number"
      step={field.type === 'integer' ? 1 : 'any'}
      onChange={(e) => {
        const value = e.target.value ? (field.type === 'decimal' ? parseFloat(e.target.value) : parseInt(e.target.value, 10)) : null;
        handleInputChange(constraint, value);
      }}
    />;
  }

  return <Input
    {...commonProps}
    type="text"
    onChange={(e) => handleInputChange(constraint, e.target.value || null)}
  />;
};

const renderDefaultInput = (field, handleInputChange) => {
  const [isNoneDefault, setIsNoneDefault] = useState(field.optional && field.default === null);
  const [isEmptyStringDefault, setIsEmptyStringDefault] = useState(field.default === '');

  const commonProps = {
    id: "default",
    className: "w-full",
    value: field.default ?? '',
    disabled: isNoneDefault || isEmptyStringDefault,
  };

  const handleNoneToggle = (checked) => {
    setIsNoneDefault(checked);
    if (checked) {
      setIsEmptyStringDefault(false);
      handleInputChange('default', null);
    } else {
      handleInputChange('default', commonProps.value || undefined);
    }
  };

  const handleEmptyStringToggle = (checked) => {
    setIsEmptyStringDefault(checked);
    if (checked) {
      setIsNoneDefault(false);
      handleInputChange('default', '');
    } else {
      handleInputChange('default', commonProps.value || undefined);
    }
  };

  const handleDefaultInputChange = (value) => {
    if (value === '') {
      handleInputChange('default', undefined);
    } else {
      handleInputChange('default', value);
    }
  };

  const renderSwitches = () => (
    <div className="flex items-center space-x-4 mt-2">
      {field.optional && (
        <div className="flex items-center space-x-2">
          <Switch
            id="defaultToNone"
            checked={isNoneDefault}
            onCheckedChange={handleNoneToggle}
          />
          <Label htmlFor="defaultToNone">None</Label>
        </div>
      )}
      {(field.type === 'string' || field.type === 'annotated') && (
        <div className="flex items-center space-x-2">
          <Switch
            id="defaultToEmptyString"
            checked={isEmptyStringDefault}
            onCheckedChange={handleEmptyStringToggle}
          />
          <Label htmlFor="defaultToEmptyString">Empty String</Label>
        </div>
      )}
    </div>
  );

  switch (field.type) {
    case 'boolean':
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="default"
              checked={field.default === true && !isNoneDefault}
              onCheckedChange={(checked) => handleInputChange('default', checked)}
              disabled={isNoneDefault}
            />
            <Label htmlFor="default">{field.default && !isNoneDefault ? 'True' : 'False'}</Label>
          </div>
          {renderSwitches()}
        </div>
      );
    case 'integer':
    case 'decimal':
      return (
        <div className="space-y-2">
          <Input
            {...commonProps}
            type="number"
            step={field.type === 'integer' ? 1 : 'any'}
            onChange={(e) => {
              const value = e.target.value ? (field.type === 'decimal' ? parseFloat(e.target.value) : parseInt(e.target.value, 10)) : undefined;
              handleDefaultInputChange(value);
            }}
          />
          {renderSwitches()}
        </div>
      );
    case 'list':
    case 'set':
      return (
        <div className="space-y-2">
          <Input
            {...commonProps}
            value={Array.isArray(field.default) ? field.default.join(', ') : ''}
            onChange={(e) => {
              const value = e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined;
              handleDefaultInputChange(value);
            }}
            placeholder="Enter default values (comma-separated)"
          />
          {renderSwitches()}
        </div>
      );
    case 'model':
      return null;
    case 'string':
    case 'annotated':
    default:
      return (
        <div className="space-y-2">
          <Input
            {...commonProps}
            onChange={(e) => handleDefaultInputChange(e.target.value)}
          />
          {renderSwitches()}
        </div>
      );
  }
};

const MetadataDialog = ({ isOpen, onClose, field, updateField }) => {
  const handleInputChange = (key, value) => {
    updateField(field.id, key, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Field Metadata</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={field.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="col-span-3"
            />
          </div>
          {field.type !== 'model' && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="default" className="text-right">
                Default
              </Label>
              <div className="col-span-3">
                {renderDefaultInput(field, handleInputChange)}
              </div>
            </div>
          )}
          {field.type !== 'model' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="examples" className="text-right">
                Examples
              </Label>
              <Input
                id="examples"
                value={field.examples ? field.examples.join(', ') : ''}
                onChange={(e) => handleInputChange('examples', e.target.value.split(',').map(s => s.trim()))}
                className="col-span-3"
              />
            </div>
          )}
          {TYPE_CONSTRAINTS[field.type].map(constraint => (
            <div key={constraint} className="grid grid-cols-7 items-center gap-4">
              <Label htmlFor={constraint} className="text-right col-span-2">
                {constraint}
              </Label>
              {renderConstraint(constraint, field, handleInputChange)}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetadataDialog;