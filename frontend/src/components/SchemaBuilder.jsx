import React, { useState, useCallback, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import FieldComponent from '@/components/FieldComponent';
import ImportDialog from '@/components/ImportDialog';
import { Button } from '@/components/ui/button';
import { DEFAULT_FIELD } from '@/utils/constants';
import ChatComponent from './ChatComponent';
import { convertJSONToField } from '@/utils/schemaUtils';
import { useToast } from "@/components/ui/use-toast";

const SchemaBuilder = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);

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

  const addField = useCallback((id) => {
    const addSubField = (fields) => {
      return fields.map(field => {
        if (field.id === id) {
          return { ...field, fields: [...field.fields, { ...DEFAULT_FIELD, id: Date.now().toString() }] };
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
      toast({
        title: "Success",
        description: "JSON imported successfully",
        className: "bg-green-500 border-green-500 text-white",
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

  return (
    <div className="flex h-screen">
      <div className="w-1/2 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Schema Builder</h2>
          <div className="flex space-x-2">
            <ImportDialog
              isImportDialogOpen={isImportDialogOpen}
              setIsImportDialogOpen={setIsImportDialogOpen}
              importJson={importJson}
            />
          </div>
        </div>
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
    </div>
  );
};

export default SchemaBuilder;