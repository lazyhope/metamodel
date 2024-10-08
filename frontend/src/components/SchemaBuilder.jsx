import React, { useState, useCallback, useEffect } from 'react';
import Joyride, { STATUS } from "react-joyride";
import { PlusCircle, BookOpenText, FileJson } from 'lucide-react';
import FieldComponent from '@/components/FieldComponent';
import ImportDialog from '@/components/ImportDialog';
import { Button } from '@/components/ui/button';
import { DEFAULT_FIELD } from '@/utils/constants';
import { convertJSONToField, generateJSON } from '@/utils/schemaUtils';
import { useToast } from "@/components/ui/use-toast";
import ChatComponent from './ChatComponent';
import CodeBlock from "./CodeBlock"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SchemaBuilder = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState([{
    ...DEFAULT_FIELD,
    id: Date.now().toString(),
    type: "model"
  }]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const tourSteps = [
    {
      target: '#model-settings-button',
      content: 'Select a model, enter your API key, and adjust generation settings.',
      disableBeacon: true,
    },
    {
      target: '#schema-editor-panel',
      content: 'Manually edit your schema here or import an existing one using the Import JSON button.',
    },
    {
      target: '#define-schema-tab',
      content: 'Generate and apply fields automatically from natural language.',
    },
    {
      target: fields.length > 0 ? `#field-select-button-${fields[0].id}` : "#schema-editor-panel",
      content: 'Select a field to load it in the chat panel.',
    },
    {
      target: '#parse-data-tab',
      content: 'Parse data using your selected schema.',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setIsTourOpen(false);
    }
  };

  const findFieldById = useCallback((fields, id) => {
    for (const field of fields) {
      if (field.id === id) {
        return field;
      }
      if (field.fields) {
        const found = findFieldById(field.fields, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (selectedField === null) {
      return;
    }

    const foundField = findFieldById(fields, selectedField.id);
    if (foundField !== selectedField) {
      setSelectedField(foundField);
    }
  }, [fields, selectedField, findFieldById]);

  const addField = useCallback((id, subFieldType = null) => {
    const addSubField = (fields) => {
      return fields.map(field => {
        if (field.id === id) {
          const newField = { ...DEFAULT_FIELD, id: Date.now().toString() };
          if (field.type === 'dict' && (subFieldType === 'key' || subFieldType === 'value')) {
            newField.name = subFieldType;
            if (subFieldType === 'key') {
              return { ...field, fields: [newField, ...field.fields] };
            }
          }
          return { ...field, fields: [...field.fields, newField] };
        }
        if (field.fields) {
          return { ...field, fields: addSubField(field.fields) };
        }
        return field;
      });
    };

    setFields(prev => addSubField(prev));
  }, []);

  const updateField = useCallback((id, key, value) => {
    const updateNestedField = (fields) => {
      return fields.map(field => {
        if (field.id === id) {
          return { ...field, [key]: value };
        }
        if (field.fields) {
          return { ...field, fields: updateNestedField(field.fields) };
        }
        return field;
      });
    };

    setFields(prev => updateNestedField(prev));
  }, []);

  const removeField = useCallback((id) => {
    const removeSubField = (fields) => {
      return fields.filter(field => {
        if (field.id === id) {
          return false;
        }
        if (field.fields) {
          field.fields = removeSubField(field.fields);
        }
        return true;
      });
    };

    setFields(prev => removeSubField(prev));
  }, []);

  const importJson = useCallback((jsonString) => {
    try {
      const jsonObject = JSON.parse(jsonString);
      const newField = convertJSONToField(jsonObject);

      setFields(prev => [...prev, newField]);
      setSelectedField(newField);
      toast({
        title: "Success",
        description: "JSON imported successfully",
        className: "bg-green-500 border-green-500 text-white",
        variant: "destructive",
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Error parsing JSON: ${error}`,
      });

      return false;
    }
  }, []);

  const toggleSelectField = useCallback((field) => {
    setSelectedField(prevSelected => prevSelected?.id === field.id ? null : field);
  }, []);

  const handleExportJson = () => {
    if (selectedField) {
      setIsExportDialogOpen(true);
    }
  };

  return (
    <div className="flex h-screen">
      <Joyride
        steps={tourSteps}
        run={isTourOpen}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
      />
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Schema Builder</h2>
          <div className="flex space-x-2">
            <Button onClick={() => setIsTourOpen(true)} className="mr-2" variant="outline" size="sm">
              <BookOpenText className="mr-2 h-4 w-4" /> Start Tour
            </Button>
            <ImportDialog
              isImportDialogOpen={isImportDialogOpen}
              setIsImportDialogOpen={setIsImportDialogOpen}
              importJson={importJson}
            />
            <Button
              onClick={handleExportJson}
              disabled={!selectedField}
              className="mr-2"
              variant="outline"
              size="sm"
            >
              <FileJson className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          </div>
        </div>
        <div id="schema-editor-panel">
          {fields.map(field => (
            <FieldComponent
              key={field.id}
              field={field}
              addField={addField}
              updateField={updateField}
              removeField={removeField}
              parentType={"root"}
              selectedField={selectedField}
              toggleSelectField={toggleSelectField}
            />
          ))}
        </div>
        <Button onClick={() => setFields(prev => [...prev, { ...DEFAULT_FIELD, id: Date.now().toString() }])} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Field
        </Button>
      </div>
      <div className="w-1/2 p-4 flex flex-col">
        <ChatComponent
          importJson={importJson}
          field={selectedField}
        />
      </div>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Exported JSON</DialogTitle>
          </DialogHeader>
          <CodeBlock
            code={selectedField ? JSON.stringify(generateJSON(selectedField), null, 2) : ''}
            language="json"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchemaBuilder;