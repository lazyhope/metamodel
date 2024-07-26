import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Edit, X, Plus } from 'lucide-react';
import { CHAT_ROLES } from '@/utils/constants';
import CodeBlock from './CodeBlock';
import { isJsonString } from '@/utils/schemaUtils';

const ChatMessage = React.memo(({ message, onEdit, onDelete, importJson = null }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);
    const imageInputRef = useRef(null);

    useEffect(() => {
        setEditedContent(message.content);
    }, [message.content]);

    const handleEdit = () => {
        if (editedContent.text || editedContent.image) {
            onEdit(message.id, editedContent);
            setIsEditing(false);
        }
        else {
            alert("Content cannot be empty.");
        }
    };

    const handleCancel = () => {
        setEditedContent(message.content);
        setIsEditing(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditedContent({ type: 'image', image: URL.createObjectURL(file) });
        }
    };

    const renderContent = () => {
        if (message.content.type === 'text') {
            if (isJsonString(message.content.text)) {
                return (
                    <CodeBlock
                        language="json"
                        code={message.content.text}
                    />
                );
            }
            return message.content.text;
        } else if (message.content.type === 'image') {
            return <img src={message.content.image} alt="Uploaded" className="max-w-full h-auto rounded" />;
        }
        return 'Unsupported content type';
    };

    return (
        <div className={`mb-2 flex ${message.role === CHAT_ROLES.USER ? 'justify-end' : 'justify-start'} group relative`}>
            <div className={`p-2 rounded-lg max-w-[75%] ${message.role === CHAT_ROLES.USER ? 'bg-blue-300' : 'bg-gray-200'}`}>
                {isEditing ? (
                    <div>
                        {message.content.type === 'text' ? (
                            <Textarea
                                value={editedContent.text}
                                onChange={(e) => setEditedContent({ "type": "text", "text": e.target.value })}
                                className="mb-2 text-black"
                                rows={3}
                            />
                        ) : (
                            <div>
                                {editedContent && editedContent.type === 'image' && (
                                    <img src={editedContent.image} alt="New upload" className="max-w-full h-auto rounded mb-2" />
                                )}
                            </div>
                        )}
                        <div className="flex justify-end">
                            {(message.content.type === 'image') && (
                                <Button onClick={() => imageInputRef.current.click()} size="sm" className="mr-2">
                                    <Image className="h-4 w-4 mr-1" />
                                    Choose New Image
                                </Button>
                            )}
                            <input
                                type="file"
                                ref={imageInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <Button onClick={handleEdit} size="sm" className="mr-2">Save</Button>
                            <Button onClick={handleCancel} size="sm">Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="break-all whitespace-pre-wrap overflow-wrap-anywhere">
                        {renderContent()}
                    </div>
                )}
            </div>
            {!isEditing && (
                <div className={`absolute bottom-0 left-0 right-0 flex ${message.role === CHAT_ROLES.USER ? 'justify-end' : 'justify-start'} translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out`}>
                    <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm" className="mr-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button onClick={() => onDelete(message.id)} variant="secondary" size="sm" className="mr-1">
                        <X className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                    {importJson && message.content.type === 'text' && isJsonString(message.content.text) && (
                        <Button onClick={() => importJson(message.content.text)} variant="secondary" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add as Field
                        </Button>
                    )}
                </div>
            )}
            <style>{`
                .group:hover {
                    margin-bottom: 2.5rem;
                    transition: margin-bottom 0.2s ease-in-out;
                }
            `}</style>
        </div>
    );
});

export default ChatMessage;