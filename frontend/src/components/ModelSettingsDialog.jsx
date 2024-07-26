import React, { useState } from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { MODEL_OPTIONS } from '@/utils/constants';

const ModelSettingsDialog = ({ isModelSettingsOpen, setIsModelSettingsOpen, modelSettings, setModelSettings }) => {
    const [showApiKey, setShowApiKey] = useState(false);
    const [selectedModel, setSelectedModel] = useState(modelSettings.model);
    const [customModel, setCustomModel] = useState('');

    const handleChange = (key, value) => {
        let updatedValue = value;
        if (key === 'temperature') {
            updatedValue = value === '' ? 0 : Math.max(0, Math.min(1, parseFloat(value) || 0));
        } else if (key === 'max_tokens' || key === 'max_attempts') {
            updatedValue = value === '' ? 1 : Math.max(1, parseInt(value, 10) || 1);
        }
        setModelSettings(prev => ({ ...prev, [key]: updatedValue }));
    };

    const handleModelChange = (value) => {
        setSelectedModel(value);
        if (value !== 'Custom Model') {
            setModelSettings(prev => ({ ...prev, model: value }));
        }
    };

    const handleCustomModelChange = (value) => {
        setCustomModel(value);
        setModelSettings(prev => ({ ...prev, model: value }));
    };

    return (
        <Dialog open={isModelSettingsOpen} onOpenChange={setIsModelSettingsOpen}>
            <DialogTrigger asChild>
                <Button className="mr-2" variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" /> Model Settings
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Model Generation Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right">
                            Model
                        </Label>
                        <Select value={selectedModel} onValueChange={handleModelChange}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                {MODEL_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedModel === 'Custom Model' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customModel" className="text-right">
                                Custom Model
                            </Label>
                            <Input
                                id="customModel"
                                value={customModel}
                                onChange={(e) => handleCustomModelChange(e.target.value)}
                                placeholder="Enter custom model name"
                                className="col-span-3"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="apiKey" className="text-right">
                            API Key
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="apiKey"
                                type={showApiKey ? "text" : "password"}
                                value={modelSettings.apiKey}
                                onChange={(e) => handleChange('apiKey', e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full"
                                onClick={() => setShowApiKey(!showApiKey)}
                            >
                                {showApiKey ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="temperature" className="text-right">
                            Temperature
                        </Label>
                        <div className="col-span-3 flex items-center gap-4">
                            <Slider
                                id="temperature"
                                min={0}
                                max={1}
                                step={0.01}
                                value={[modelSettings.temperature]}
                                onValueChange={([value]) => handleChange('temperature', value)}
                                className="flex-grow"
                            />
                            <Input
                                type="number"
                                value={modelSettings.temperature}
                                onChange={(e) => handleChange('temperature', e.target.value)}
                                min={0}
                                max={1}
                                step={0.01}
                                className="w-20"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="max_tokens" className="text-right">
                            Max Tokens
                        </Label>
                        <Input
                            id="max_tokens"
                            type="number"
                            value={modelSettings.max_tokens}
                            onChange={(e) => handleChange('max_tokens', e.target.value)}
                            min={1}
                            step={1}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="max_attempts" className="text-right">
                            Max Attempts
                        </Label>
                        <Input
                            id="max_attempts"
                            type="number"
                            value={modelSettings.max_attempts}
                            onChange={(e) => handleChange('max_attempts', e.target.value)}
                            min={1}
                            step={1}
                            className="col-span-3"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ModelSettingsDialog;