import React, { useState, useEffect, useRef } from 'react';
import {
    Send, User, Clock, AlertCircle,
    Loader2, Info, MessageSquare
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardSharedUI';
import AxiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/authContext';

const TenantMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [landlordData, setLandlordData] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    // Auto-scroll ref
    const messagesEndRef = useRef(null);

    // --- 1. FETCH CHAT HISTORY ---
    useEffect(() => {
        const fetchChatData = async () => {
            try {
                setIsLoading(true);
                // Replace with your actual messages endpoint
                const response = await AxiosInstance.get('/messages/tenant/history');

                setMessages(response.data.messages || []);
                // Assuming backend sends landlord info alongside messages
                setLandlordData(response.data.landlord || { name: 'Property Manager' });
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError("Failed to load messages. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatData();
    }, []);

    // --- 2. AUTO-SCROLL TO BOTTOM ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 3. SEND MESSAGE HANDLER ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageText = newMessage.trim();
        setNewMessage(''); // Clear input instantly for better UX

        try {
            setIsSending(true);
            // Replace with your actual send message endpoint
            const response = await AxiosInstance.post('/messages/send', {
                text: messageText,
                receiverId: landlordData?._id // If needed by your backend
            });

            // Append new message to UI
            setMessages([...messages, response.data.message]);
        } catch (err) {
            setError("Failed to send message. Please try again.");
            setNewMessage(messageText); // Put text back if failed
        } finally {
            setIsSending(false);
        }
    };

    // --- 4. UI HELPERS ---
    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString([], options);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 h-[calc(100vh-140px)] flex flex-col">

            <DashboardHeader
                title="Messages"
                subtitle="Communicate directly with your landlord or property manager."
            />

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-100 flex-shrink-0">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {/* CHAT INTERFACE */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">

                {/* Chat Header */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {landlordData?.name?.charAt(0) || <User size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{landlordData?.name || 'Property Manager'}</h3>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online / Usually responds in hours
                            </p>
                        </div>
                    </div>
                    <button className="text-slate-400 hover:text-blue-600 transition p-2" title="Contact Info">
                        <Info size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageSquare size={48} className="mb-3 opacity-50" />
                            <p className="font-medium text-slate-600">No messages yet.</p>
                            <p className="text-sm">Send a message to start the conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            // Check if message is from the logged-in tenant
                            const isMe = msg.senderId === user?._id;

                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'order-1' : 'order-2'}`}>
                                        <div className={`p-4 rounded-2xl ${isMe
                                            ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                                            }`}>
                                            <p className="text-sm md:text-base leading-relaxed break-words">{msg.text}</p>
                                        </div>
                                        <p className={`text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <Clock size={10} /> {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} /> {/* Invisible element to anchor scroll */}
                </div>

                {/* Message Input Area */}
                <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 px-4 py-3 rounded-xl outline-none transition"
                            disabled={isSending || isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending || isLoading}
                            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-400 mt-2">
                        Keep communication professional. Messages are recorded for security purposes.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default TenantMessages;