import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Image, Trash2, Play, Loader } from 'lucide-react';
import { generateSchemaJSON } from '@/utils/schemaUtils';
import { CHAT_ROLES, DEFAULT_MODEL_SETTINGS } from '@/utils/constants';
import ChatMessage from './ChatMessage';
import ModelSettingsDialog from './ModelSettingsDialog';
import { defineSchema, parseData } from '@/utils/apiClient';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatComponent = ({ importJson, field = null }) => {
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [runMessages, setRunMessages] = useState(false);

    const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);
    const [modelSettings, setModelSettings] = useState(DEFAULT_MODEL_SETTINGS);

    const [activeTab, setActiveTab] = useState('defineSchema');
    const [defineSchemaMessages, setDefineSchemaMessages] = useState([]);
    const [parseDataMessages, setParseDataMessages] = useState([]);

    const imageInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const messageInputRef = useRef(null);

    const currentMessageSetter = activeTab === 'defineSchema' ? setDefineSchemaMessages : setParseDataMessages;
    const currentMessages = activeTab === 'defineSchema' ? defineSchemaMessages : parseDataMessages;

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, scrollToBottom]);

    useEffect(() => {
        if (field !== null) {
            setActiveTab('parseData');
        }
    }, [field]);

    const convertToOpenAIMessage = async ({ role, content }) => {
        if (content.type === 'image') {
            const blob = await fetch(content.image).then(res => res.blob());
            const base64data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
            return {
                role,
                content: [{ type: "image_url", image_url: { url: base64data } }]
            };
        }
        return { role, content: content.text };
    }

    const sendMessages = async () => {
        if (!runMessages || currentMessages.length < 1) return;
        setIsLoading(true);

        try {
            const convertedMessages = await Promise.all(
                currentMessages.map(convertToOpenAIMessage)
            );

            let response;
            if (activeTab === 'parseData') {
                const schema = generateSchemaJSON(field);
                response = await parseData({
                    messages: convertedMessages,
                    schema,
                    model: modelSettings.model,
                    temperature: modelSettings.temperature,
                    max_tokens: modelSettings.max_tokens,
                    max_attempts: modelSettings.max_attempts,
                    apiKey: modelSettings.apiKey
                });
            } else {
                response = await defineSchema({
                    messages: convertedMessages,
                    model: modelSettings.model,
                    temperature: modelSettings.temperature,
                    max_tokens: modelSettings.max_tokens,
                    max_attempts: modelSettings.max_attempts,
                    apiKey: modelSettings.apiKey
                });
            }

            const assistantMessage = {
                id: Date.now(),
                role: CHAT_ROLES.ASSISTANT,
                content: {
                    type: "text",
                    text: JSON.stringify(response.data, null, 2)
                }
            };

            currentMessageSetter(prev => [...prev, assistantMessage]);
        } catch (error) {
            toast({
                title: "Error calling API",
                description: JSON.stringify(error, null, 2),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        sendMessages();
        setRunMessages(false);
    }, [runMessages]);

    const handleAddMessage = () => {
        const currentMessage = messageInputRef.current.value.trim();
        if (currentMessage === '' && !imageInputRef.current.files[0]) return;

        const newMessage = imageInputRef.current.files[0]
            ? { type: 'image', image: URL.createObjectURL(imageInputRef.current.files[0]) }
            : { type: 'text', text: currentMessage };

        const userMessage = {
            id: Date.now(),
            role: CHAT_ROLES.USER,
            content: newMessage
        };

        currentMessageSetter(prev => [...prev, userMessage]);
        messageInputRef.current.value = '';
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleRun = useCallback(() => {
        handleAddMessage();
        if (!(activeTab === 'parseData' && field === null)) {
            setRunMessages(true);
        }
    }, [activeTab, field]);

    const handleClearChat = () => {
        currentMessageSetter([]);
    };

    const handleEditMessage = (id, newContent) => {
        currentMessageSetter(prev => prev.map(msg =>
            msg.id === id ? { ...msg, content: newContent } : msg
        ));
    };

    const handleDeleteMessage = (id) => {
        currentMessageSetter(prev => prev.filter(msg => msg.id !== id));
    };

    const memoizedChatMessages = useMemo(() => {
        return currentMessages.map(message => (
            <ChatMessage
                key={message.id}
                message={message}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                importJson={activeTab === 'defineSchema' ? importJson : null}
            />
        ));
    }, [defineSchemaMessages, parseDataMessages, activeTab]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Chat</h2>
                <ModelSettingsDialog
                    isModelSettingsOpen={isModelSettingsOpen}
                    setIsModelSettingsOpen={setIsModelSettingsOpen}
                    modelSettings={modelSettings}
                    setModelSettings={setModelSettings}
                />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger id="define-schema-tab" value="defineSchema">Define Schema</TabsTrigger>
                    <TabsTrigger id="parse-data-tab" value="parseData">Parse Data</TabsTrigger>
                </TabsList>
                <div className="flex-grow flex flex-col overflow-hidden">
                    <TabsContent value="defineSchema" className="flex-grow flex flex-col data-[state=inactive]:hidden overflow-hidden">
                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 p-4 border rounded">
                            {memoizedChatMessages}
                            {isLoading && (
                                <div className="flex justify-center items-center mt-4">
                                    <Loader className="h-6 w-6 animate-spin" />
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="parseData" className="flex-grow flex flex-col data-[state=inactive]:hidden overflow-hidden">
                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 p-4 border rounded">
                            {memoizedChatMessages}
                            {isLoading && (
                                <div className="flex justify-center items-center mt-4">
                                    <Loader className="h-6 w-6 animate-spin" />
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
            <div className="flex flex-col">
                <div className="flex mb-2">
                    <Textarea
                        ref={messageInputRef}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleRun();
                            }
                        }}
                        placeholder="Type your message..."
                        className="flex-grow mr-2"
                        disabled={isLoading}
                        rows={3}
                    />
                </div>
                <div className="flex justify-between">
                    <Button onClick={handleAddMessage} variant="outline" className="flex-grow mr-2" disabled={isLoading}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Message
                    </Button>
                    <Button onClick={() => imageInputRef.current.click()} variant="outline" className="flex-grow mr-2" disabled={isLoading}>
                        <Image className="h-4 w-4 mr-2" />
                        Add Image
                    </Button>
                    <Button
                        onClick={handleRun}
                        variant="outline"
                        className="flex-grow mr-2"
                        disabled={isLoading || (activeTab === 'parseData' && field === null)}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Run
                    </Button>
                    <Button onClick={handleClearChat} variant="outline" disabled={isLoading}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </div>
            <input
                type="file"
                ref={imageInputRef}
                onChange={handleAddMessage}
                accept="image/*"
                style={{ display: 'none' }}
                disabled={isLoading}
            />
        </div>
    );
};

export default ChatComponent;