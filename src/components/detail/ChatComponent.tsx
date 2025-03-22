import React, { useState, useEffect, useRef } from 'react';
import { AIAssistantMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface ChatComponentProps {
    checkType: 'mfa' | 'rls' | 'pitr';
    systemPrompt: string;
    initialMessage?: string;
}

export default function ChatComponent({
    checkType,
    systemPrompt,
    initialMessage = ''
}: ChatComponentProps) {
    const [messages, setMessages] = useState<AIAssistantMessage[]>([
        { role: 'system', content: systemPrompt },
    ]);
    const [input, setInput] = useState(initialMessage);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;


        const userMessage: AIAssistantMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to get AI response');
            }

            const data = await response.json();

            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: data.message }
            ]);
        } catch (err) {
            console.error('Error sending message:', err);
            setError((err as Error).message || 'Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageContent = (content: string, isUser: boolean) => {
        if (isUser) {
            return <div className="whitespace-pre-wrap break-words">{content}</div>;
        }

        return (
            <div className="prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-pre:my-1">
                <ReactMarkdown>
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[500px] border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-medium">AI Assistant</h3>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {checkType.toUpperCase()} Support
                </span>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.filter(m => m.role !== 'system').map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <div
                            className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${message.role === 'user'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                        >
                            {renderMessageContent(message.content, message.role === 'user')}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="mb-4 text-left">
                        <div className="inline-block px-4 py-2 rounded-lg bg-gray-100">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        Error: {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        disabled={isLoading}
                        rows={3}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 h-fit bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}