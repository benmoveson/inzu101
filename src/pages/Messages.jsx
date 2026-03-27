import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { MessageSquare, Loader2, User, Send, ArrowLeft, Phone, MoreVertical, Reply, Mic, Square, Play, Pause, Smile } from 'lucide-react';
import './Messages.css';

export default function Messages() {
    const { user, loading } = useAuth();
    const { socket, isConnected } = useWebSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [showMenu, setShowMenu] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [chatBackground, setChatBackground] = useState(null);
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [playingAudio, setPlayingAudio] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRefs = useRef({});
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);

    // Load chat background from localStorage
    useEffect(() => {
        const savedBackground = localStorage.getItem('inzu_chat_background');
        if (savedBackground) {
            setChatBackground(savedBackground);
        }
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    // Listen for real-time message updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = ({ message, conversationId }) => {
            console.log('New message received:', message);
            
            // Update messages if this conversation is currently open
            if (selectedConversation && selectedConversation._id === conversationId) {
                setMessages(prev => [...prev, message]);
            }
            
            // Update conversations list
            fetchConversations();
        };

        const handleMessageSeen = ({ messageId, conversationId, seenAt }) => {
            console.log('Message seen:', messageId);
            
            // Update message seen status if this conversation is currently open
            if (selectedConversation && selectedConversation._id === conversationId) {
                setMessages(prev => 
                    prev.map(m => 
                        m._id === messageId 
                            ? { ...m, seen: true, seenAt } 
                            : m
                    )
                );
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_seen', handleMessageSeen);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_seen', handleMessageSeen);
        };
    }, [socket, isConnected, selectedConversation]);

    // Listen for polling updates (fallback when WebSocket unavailable)
    useEffect(() => {
        const handlePollingUpdate = (event) => {
            const { type } = event.detail;
            
            if (type === 'messages') {
                console.log('Messages update from polling');
                // Refresh conversations to get latest unread counts
                fetchConversations();
            }
        };

        window.addEventListener('polling-update', handlePollingUpdate);
        
        return () => {
            window.removeEventListener('polling-update', handlePollingUpdate);
        };
    }, []);

    // Handle incoming property/landlord from PropertyCard
    useEffect(() => {
        if (location.state?.landlordId && location.state?.propertyId) {
            // Create or select conversation with this landlord
            const propertyId = location.state.propertyId;
            const landlordId = location.state.landlordId;
            
            // Check if conversation already exists
            const existing = conversations.find(c => 
                c._id === `${landlordId}-${propertyId}`
            );
            
            if (existing) {
                selectConversation(existing);
            } else {
                // Create new conversation object
                const newConv = {
                    _id: `${landlordId}-${propertyId}`,
                    otherUser: { _id: landlordId, name: 'Property Owner' },
                    property: { _id: propertyId, title: location.state.propertyTitle },
                    isNew: true
                };
                setSelectedConversation(newConv);
                setMessages([]);
            }
        }
    }, [location.state, conversations]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.message-menu') && !e.target.closest('.more-btn')) {
                setShowMenu(null);
            }
            if (!e.target.closest('.chat-dropdown-menu') && !e.target.closest('.icon-btn')) {
                setShowChatMenu(false);
            }
            // Check if click is outside both the emoji picker and the emoji button
            if (!e.target.closest('.emoji-picker-container') && !e.target.closest('.emoji-picker')) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleEmojiSelect = (emoji) => {
        const input = messageInputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = newMessage;
        const before = text.substring(0, start);
        const after = text.substring(end);
        
        setNewMessage(before + emoji + after);
        setShowEmojiPicker(false);
        
        // Set cursor position after emoji
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
    };

    const commonEmojis = [
        '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
        '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
        '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
        '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
        '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
        '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
        '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '💪',
        '🙏', '✍️', '💅', '🤳', '💃', '🕺', '👯', '🧘', '🛀', '🛌',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✨', '⭐', '🌟', '💫', '🔥', '💥', '💯', '✅', '❌', '⚠️'
    ];

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch('http://localhost:5000/api/messages/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setConversations(data);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setMessages([]);
        
        if (conversation.isNew) return;

        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch(`http://localhost:5000/api/messages/${conversation._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(data);
                
                // Update conversation unread count to 0 in local state
                setConversations(prevConvs => 
                    prevConvs.map(c => 
                        c._id === conversation._id 
                            ? { ...c, unreadCount: 0 }
                            : c
                    )
                );
            }
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const token = localStorage.getItem('inzu_token');
            
            // Determine recipientId and propertyId based on conversation type
            let recipientId, propertyId, conversationId;
            
            if (selectedConversation.isNew) {
                // New conversation from PropertyCard
                const [landlordId, propId] = selectedConversation._id.split('-');
                recipientId = landlordId;
                propertyId = propId;
            } else {
                // Existing conversation
                conversationId = selectedConversation._id;
                recipientId = selectedConversation.otherUser._id;
                propertyId = selectedConversation.property?._id;
            }

            console.log('Sending message with:', { 
                conversationId, 
                recipientId, 
                propertyId, 
                text: newMessage.substring(0, 20),
                replyToId: replyingTo?._id 
            });
            
            const res = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId,
                    recipientId,
                    propertyId,
                    text: newMessage,
                    replyToId: replyingTo?._id
                })
            });

            const data = await res.json();
            console.log('Send message response:', { status: res.status, data });
            
            if (res.ok) {
                setMessages([...messages, data]);
                setNewMessage('');
                setReplyingTo(null);
                
                // If it was a new conversation, refresh conversations list
                if (selectedConversation.isNew) {
                    setSelectedConversation({
                        ...selectedConversation,
                        _id: data.conversationId,
                        isNew: false
                    });
                    fetchConversations();
                }
            } else {
                console.error('Failed to send:', data);
                alert(`Failed to send message: ${data.message || 'Unknown error'}\n${data.error || ''}`);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Error sending message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const deleteMessage = async (messageId) => {
        console.log('Unsending message:', messageId);
        try {
            const token = localStorage.getItem('inzu_token');
            console.log('Token:', token ? 'exists' : 'missing');
            
            const res = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                // Update message in state to show as unsent
                setMessages(messages.map(m => m._id === messageId ? data : m));
                setShowMenu(null);
                console.log('Message unsent successfully');
            } else {
                console.error('Failed to unsend:', data);
            }
        } catch (err) {
            console.error('Error unsending message:', err);
        }
    };



    const handleReply = (message) => {
        setReplyingTo(message);
        setShowMenu(null);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                
                // Send immediately on stop
                await sendVoiceNoteImmediately(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendVoiceNoteImmediately = async (audioBlob) => {
        if (!audioBlob) return;

        try {
            const token = localStorage.getItem('inzu_token');
            
            // Determine recipientId and propertyId based on conversation type
            let recipientId, propertyId, conversationId;
            
            if (selectedConversation.isNew) {
                // New conversation from PropertyCard
                const [landlordId, propId] = selectedConversation._id.split('-');
                recipientId = landlordId;
                propertyId = propId;
            } else {
                // Existing conversation
                conversationId = selectedConversation._id;
                recipientId = selectedConversation.otherUser._id;
                propertyId = selectedConversation.property?._id;
            }

            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice-note.webm');
            if (conversationId) formData.append('conversationId', conversationId);
            formData.append('recipientId', recipientId);
            formData.append('propertyId', propertyId);
            if (replyingTo) {
                formData.append('replyToId', replyingTo._id);
            }

            const res = await fetch('http://localhost:5000/api/messages/voice', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setMessages([...messages, data]);
                setReplyingTo(null);
                
                if (selectedConversation.isNew) {
                    setSelectedConversation({
                        ...selectedConversation,
                        _id: data.conversationId,
                        isNew: false
                    });
                    fetchConversations();
                }
            } else {
                console.error('Failed to send voice note:', data.message);
                alert('Failed to send voice note: ' + data.message);
            }
        } catch (err) {
            console.error('Error sending voice note:', err);
            alert('Error sending voice note. Please try again.');
        }
    };

    const togglePlayAudio = (messageId) => {
        const audio = audioRefs.current[messageId];
        if (!audio) return;

        if (playingAudio === messageId) {
            audio.pause();
            setPlayingAudio(null);
        } else {
            // Pause any currently playing audio
            if (playingAudio && audioRefs.current[playingAudio]) {
                audioRefs.current[playingAudio].pause();
            }
            audio.play();
            setPlayingAudio(messageId);
        }
    };

    // Handle audio ended event
    useEffect(() => {
        Object.keys(audioRefs.current).forEach(messageId => {
            const audio = audioRefs.current[messageId];
            if (audio) {
                audio.onended = () => {
                    if (playingAudio === messageId) {
                        setPlayingAudio(null);
                    }
                };
            }
        });
    }, [playingAudio]);

    const deleteChat = async () => {
        if (!window.confirm('Delete this conversation? This will only delete it for you.')) return;

        console.log('Deleting conversation:', selectedConversation._id);
        
        try {
            const token = localStorage.getItem('inzu_token');
            const res = await fetch(`http://localhost:5000/api/messages/conversation/${selectedConversation._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Delete response status:', res.status);
            
            if (res.ok) {
                const data = await res.json();
                console.log('Delete response:', data);
                // Remove conversation from list
                setConversations(conversations.filter(c => c._id !== selectedConversation._id));
                setSelectedConversation(null);
                setMessages([]);
                setShowChatMenu(false);
            } else {
                const errorData = await res.json();
                console.error('Delete failed:', errorData);
            }
        } catch (err) {
            console.error('Error deleting conversation:', err);
        }
    };

    const handleBackgroundChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result;
                setChatBackground(imageUrl);
                localStorage.setItem('inzu_chat_background', imageUrl);
                setShowBackgroundModal(false);
                setShowChatMenu(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeBackground = () => {
        setChatBackground(null);
        localStorage.removeItem('inzu_chat_background');
        setShowBackgroundModal(false);
        setShowChatMenu(false);
    };

    if (loading || isLoading) {
        return (
            <div className="loading-container">
                <Loader2 className="animate-spin" size={48} />
                <p>Loading messages...</p>
            </div>
        );
    }

    if (!user) return null;

    const getOtherUser = (conversation) => {
        return conversation.otherUser || { name: 'User' };
    };

    return (
        <div className="messages-page-ig">
            <div className="messages-container">
                {/* Conversations List */}
                <div className={`conversations-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
                    <div className="sidebar-header">
                        <h2>{user.name}</h2>
                    </div>
                    
                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="empty-conversations">
                                <MessageSquare size={48} color="#ccc" />
                                <p>No messages yet</p>
                                <small>Contact a property owner to start chatting</small>
                            </div>
                        ) : (
                            conversations.map((conversation) => {
                                const otherUser = getOtherUser(conversation);
                                return (
                                    <div
                                        key={conversation._id}
                                        className={`conversation-item ${selectedConversation?._id === conversation._id ? 'active' : ''}`}
                                        onClick={() => selectConversation(conversation)}
                                    >
                                        <div className="conversation-avatar">
                                            {otherUser.avatar ? (
                                                <img src={otherUser.avatar} alt={otherUser.name} />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div className="conversation-info">
                                            <h4>{otherUser.name}</h4>
                                            <p className="last-message">
                                                {conversation.lastMessage || 'Start a conversation'}
                                            </p>
                                        </div>
                                        {conversation.unreadCount > 0 && (
                                            <span className="unread-badge">{conversation.unreadCount}</span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat View */}
                <div className={`chat-view ${selectedConversation ? 'active' : ''}`}>
                    {selectedConversation ? (
                        <>
                            <div className="chat-header">
                                <button 
                                    className="back-btn"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="chat-header-info">
                                    <div className="chat-avatar">
                                        {getOtherUser(selectedConversation).avatar ? (
                                            <img src={getOtherUser(selectedConversation).avatar} alt={getOtherUser(selectedConversation).name} />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3>{getOtherUser(selectedConversation).name}</h3>
                                        {selectedConversation.propertyTitle && (
                                            <p className="property-title">{selectedConversation.propertyTitle}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button className="icon-btn">
                                        <Phone size={20} />
                                    </button>
                                    <div className="chat-menu-container">
                                        <button 
                                            className="icon-btn"
                                            onClick={() => setShowChatMenu(!showChatMenu)}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {showChatMenu && (
                                            <div className="chat-dropdown-menu">
                                                <button 
                                                    className="chat-menu-item"
                                                    onClick={() => {
                                                        setShowBackgroundModal(true);
                                                        setShowChatMenu(false);
                                                    }}
                                                >
                                                    Change Background
                                                </button>
                                                <button 
                                                    className="chat-menu-item delete"
                                                    onClick={deleteChat}
                                                >
                                                    Delete Chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div 
                                className="messages-area"
                                style={{
                                    backgroundImage: chatBackground ? `url(${chatBackground})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {messages.length === 0 ? (
                                    <div className="empty-messages">
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((message) => {
                                        // Check multiple ways to determine if message is sent by current user
                                        const messageSenderId = message.senderId?._id || message.senderId || message.sender?._id || message.sender;
                                        const currentUserId = user?._id || user?.id;
                                        const isSent = messageSenderId?.toString() === currentUserId?.toString();
                                        
                                        // Find replied message if exists
                                        const repliedMessage = message.replyTo ? messages.find(m => m._id === message.replyTo) : null;
                                        
                                        return (
                                            <div key={message._id}>
                                                {repliedMessage && (
                                                    <div className={`reply-indicator ${isSent ? 'sent' : 'received'}`}>
                                                        <span className="reply-text">
                                                            You replied to {isSent ? getOtherUser(selectedConversation).name : 'yourself'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`message-row ${isSent ? 'sent' : 'received'}`}
                                                    onMouseEnter={() => setHoveredMessage(message._id)}
                                                    onMouseLeave={() => {
                                                        setHoveredMessage(null);
                                                        if (showMenu !== message._id) setShowMenu(null);
                                                    }}
                                                >
                                                    <div className="message-content">
                                                        <div className={`message-bubble ${message.isUnsent ? 'unsent' : ''} ${message.voiceNote ? 'voice-bubble' : ''}`}>
                                                            {message.isUnsent ? (
                                                                <p className="unsent-text">
                                                                    <i>Message unavailable</i>
                                                                </p>
                                                            ) : message.voiceNote ? (
                                                                <div className="voice-message-ig">
                                                                    <button 
                                                                        className="voice-play-btn"
                                                                        onClick={() => togglePlayAudio(message._id)}
                                                                    >
                                                                        {playingAudio === message._id ? (
                                                                            <Pause size={16} fill="currentColor" />
                                                                        ) : (
                                                                            <Play size={16} fill="currentColor" />
                                                                        )}
                                                                    </button>
                                                                    <div className="voice-waveform">
                                                                        <div className="waveform-bars">
                                                                            {[...Array(25)].map((_, i) => (
                                                                                <div 
                                                                                    key={i} 
                                                                                    className="wave-bar"
                                                                                    style={{ 
                                                                                        height: `${Math.random() * 60 + 40}%`,
                                                                                        animationDelay: `${i * 0.05}s`
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <audio 
                                                                        ref={el => audioRefs.current[message._id] = el}
                                                                        src={`http://localhost:5000${message.voiceNote}`}
                                                                        style={{ display: 'none' }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {repliedMessage && (
                                                                        <div className="replied-message">
                                                                            <p>{repliedMessage.isUnsent ? 'Message unavailable' : repliedMessage.text}</p>
                                                                        </div>
                                                                    )}
                                                                    <p>{message.text}</p>
                                                                    {message.reaction && (
                                                                        <span className="message-reaction">{message.reaction}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        {!message.isUnsent && (hoveredMessage === message._id || showMenu === message._id) && (
                                                            <div className="message-hover-actions">
                                                                <button 
                                                                    className="more-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowMenu(showMenu === message._id ? null : message._id);
                                                                    }}
                                                                >
                                                                    <MoreVertical size={16} />
                                                                </button>
                                                                <button 
                                                                    className="reply-btn" 
                                                                    title="Reply"
                                                                    onClick={() => handleReply(message)}
                                                                >
                                                                    <Reply size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {showMenu === message._id && (
                                                            <div className={`message-menu ${isSent ? 'sent-menu' : 'received-menu'}`}>
                                                                <button 
                                                                    className="menu-item"
                                                                    onClick={() => {
                                                                        handleReply(message);
                                                                        setShowMenu(null);
                                                                    }}
                                                                >
                                                                    <span>Reply</span>
                                                                </button>
                                                                {!message.voiceNote && (
                                                                    <button className="menu-item" onClick={() => {
                                                                        navigator.clipboard.writeText(message.text);
                                                                        setShowMenu(null);
                                                                    }}>
                                                                        <span>Copy</span>
                                                                    </button>
                                                                )}
                                                                {isSent && (
                                                                    <button 
                                                                        className="menu-item unsend"
                                                                        onClick={() => deleteMessage(message._id)}
                                                                    >
                                                                        <span>Unsend</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Seen indicator below message like WhatsApp */}
                                                    {isSent && message.seen && !message.isUnsent && (
                                                        <span className="seen-indicator-below" title="Seen">✓✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-input-area" onSubmit={sendMessage}>
                                {replyingTo && (
                                    <div className="replying-to-bar">
                                        <div className="replying-content">
                                            <Reply size={14} />
                                            <span>Replying to: {replyingTo.text?.substring(0, 30) || 'Voice message'}...</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setReplyingTo(null)}
                                            className="cancel-reply"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <div className={`input-with-mic ${isRecording ? 'recording' : ''}`}>
                                    <button 
                                        type="button"
                                        className={`mic-btn ${isRecording ? 'recording' : ''}`}
                                        onMouseDown={startRecording}
                                        onMouseUp={stopRecording}
                                        onTouchStart={startRecording}
                                        onTouchEnd={stopRecording}
                                        title={isRecording ? "Release to send" : "Hold to record voice note"}
                                    >
                                        {isRecording ? <Square size={20} /> : <Mic size={20} />}
                                    </button>
                                    {isRecording && (
                                        <div className="recording-waveform">
                                            <div className="wave-bar"></div>
                                            <div className="wave-bar"></div>
                                            <div className="wave-bar"></div>
                                            <div className="wave-bar"></div>
                                            <div className="wave-bar"></div>
                                        </div>
                                    )}
                                    <input
                                        ref={messageInputRef}
                                        type="text"
                                        placeholder={isRecording ? "Recording... Release to send" : "Message..."}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isSending || isRecording}
                                        style={{ opacity: isRecording ? 0 : 1 }}
                                    />
                                    <div className="emoji-picker-container">
                                        <button 
                                            type="button"
                                            className="emoji-btn"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            title="Add emoji"
                                        >
                                            <Smile size={20} />
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="emoji-picker">
                                                <div className="emoji-grid">
                                                    {commonEmojis.map((emoji, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            className="emoji-option"
                                                            onClick={() => handleEmojiSelect(emoji)}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!newMessage.trim() || isSending}
                                        className="send-btn"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <MessageSquare size={64} color="#ccc" />
                            <h3>Your Messages</h3>
                            <p>Send private messages to property owners</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Change Modal */}
            {showBackgroundModal && (
                <div className="background-modal-overlay" onClick={() => setShowBackgroundModal(false)}>
                    <div className="background-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Change Chat Background</h3>
                        <p>Choose a custom image for your chat background</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundChange}
                            style={{ display: 'none' }}
                            id="background-upload"
                        />
                        <div className="background-modal-actions">
                            <label htmlFor="background-upload" className="btn btn-primary">
                                Upload Image
                            </label>
                            {chatBackground && (
                                <button className="btn btn-secondary" onClick={removeBackground}>
                                    Remove Background
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={() => setShowBackgroundModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
