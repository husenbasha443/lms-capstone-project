import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('internal'); // internal | external
    const messagesEndRef = useRef(null);
    const location = useLocation();

    // Hide on auth pages
    const hideOnRoutes = ['/', '/login', '/signup', '/forgot-password'];
    if (hideOnRoutes.includes(location.pathname)) return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Load history on open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/chat/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const tempMsg = {
            role: 'user',
            message: input,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: tempMsg.message, mode })
            });

            if (res.ok) {
                const data = await res.json();
                const aiMsg = {
                    role: 'ai',
                    response: data.response, // Backend returns { response: "..." }
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', response: "Error: Could not get response.", timestamp: new Date().toISOString() }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', response: "Error: Network issue.", timestamp: new Date().toISOString() }]);
        }
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-sm">AI Assistant</h3>
                                <p className="text-slate-400 text-[10px]">Powered by Azure OpenAI</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2">
                        <button
                            onClick={() => setMode('internal')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${mode === 'internal' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            Platform Data
                        </button>
                        <button
                            onClick={() => setMode('external')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${mode === 'external' ? 'bg-white text-purple-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            General Knowledge
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.length === 0 && (
                            <div className="text-center mt-10 space-y-2">
                                <span className="material-symbols-outlined text-4xl text-slate-300">forum</span>
                                <p className="text-slate-500 text-sm">Ask me anything about your courses, students, or analytics!</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user' || msg.role === 'student' || msg.role === 'trainer' || msg.role === 'admin';
                            // Accommodate backend storing actual role string
                            return (
                                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isUser
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                        }`}>
                                        {isUser ? (
                                            msg.message
                                        ) : (
                                            <ReactMarkdown className="prose prose-sm max-w-none prose-slate">
                                                {msg.response || msg.message}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-slate-200">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                className="p-1.5 rounded-lg bg-white shadow-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all duration-300"
            >
                {isOpen ? (
                    <span className="material-symbols-outlined text-2xl">expand_more</span>
                ) : (
                    <span className="material-symbols-outlined text-2xl">smart_toy</span>
                )}
            </button>
        </div>
    );
}
