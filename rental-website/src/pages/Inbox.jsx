import React, { useState, useEffect } from 'react';

const ChatApplication = () => {
  // State for chats with initial empty array
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sarah Johnson', text: "Hey there! How's the project going?", time: '10:15 AM', isMine: false },
    { id: 2, sender: 'You', text: "It's going well! Just finishing up the final touches.", time: '10:20 AM', isMine: true },
    { id: 3, sender: 'Sarah Johnson', text: 'Great! Can we meet tomorrow to discuss?', time: '10:25 AM', isMine: false },
    { id: 4, sender: 'You', text: "Sure, I'm free in the afternoon.", time: '10:28 AM', isMine: true },
    { id: 5, sender: 'Sarah Johnson', text: "Perfect! Let's meet at the cafe at 2 PM.", time: '10:29 AM', isMine: false },
    { id: 6, sender: 'You', text: 'Sounds good!', time: '10:30 AM', isMine: true }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chats data from API
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://192.168.100.17:3000/chats');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        setChats(data);
        // Select first chat by default if available
        if (data.length > 0) {
          setSelectedChat(data[0].id);
        }
      } catch (err) {
        setError(err.message);
        // Fallback to sample data if API fails
        setChats([
          { id: 1, name: 'Sarah Johnson', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 2, avatar: '/api/placeholder/40/40' },
          { id: 2, name: 'David Williams', lastMessage: 'Did you get my email?', time: 'Yesterday', unread: 0, avatar: '/api/placeholder/40/40' },
          { id: 3, name: 'Team Project', lastMessage: 'Alex: I finished the design', time: 'Yesterday', unread: 5, avatar: '/api/placeholder/40/40', isGroup: true },
          { id: 4, name: 'Michael Brown', lastMessage: 'Thanks for the help!', time: 'Monday', unread: 0, avatar: '/api/placeholder/40/40' },
          { id: 5, name: 'Emma Davis', lastMessage: 'Let me check and get back to you', time: 'Sunday', unread: 0, avatar: '/api/placeholder/40/40' }
        ]);
        setSelectedChat(1);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleSelectChat = (id) => {
    setSelectedChat(id);
    // Mark as read when selected
    setChats(chats.map(chat => 
      chat.id === id ? { ...chat, unread: 0 } : chat
    ));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-xl">Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="p-4">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat === chat.id ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex items-center">
                <img 
                  src={chat.avatar} 
                  alt={chat.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-medium ${chat.unread > 0 ? 'font-bold' : ''}`}>
                      {chat.name}
                      {chat.isGroup && <span className="ml-2 text-xs bg-gray-200 px-1 rounded">Group</span>}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Page */}
      <div className="flex-1 flex flex-col">
        {selectedChat && (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center">
              <img 
                src="/api/placeholder/40/40" 
                alt="Chat avatar" 
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <h2 className="font-bold">{chats.find(c => c.id === selectedChat)?.name}</h2>
                <p className="text-xs text-gray-500">Online</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-lg ${
                      message.isMine ? 'bg-blue-600 text-white' : 'bg-white border'
                    }`}>
                      {!message.isMine && (
                        <div className="font-bold text-sm">{message.sender}</div>
                      )}
                      <p>{message.text}</p>
                      <div className={`text-xs mt-1 text-right ${
                        message.isMine ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <button type="button" className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatApplication;