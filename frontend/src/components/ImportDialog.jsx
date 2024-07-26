import React, { useState } from 'react';
import { Import } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IMPORT_DIALOG_PLACEHOLDER } from '@/utils/constants';

const ImportDialog = ({ isImportDialogOpen, setIsImportDialogOpen, importJson }) => {
  const [inputJson, setInputJson] = useState('');

  const handleImport = () => {
    if (importJson(inputJson)) {
      setIsImportDialogOpen(false);
      setInputJson('');
    }
  };

  return (
    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
      <DialogTrigger asChild>
        <Button className="mr-2" variant="outline" size="sm">
          <Import className="mr-2 h-4 w-4" /> Import JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import JSON</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="import-json">Paste your JSON schema here:</Label>
          <Textarea
            id="import-json"
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            placeholder={IMPORT_DIALOG_PLACEHOLDER}
            rows={10}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleImport}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;