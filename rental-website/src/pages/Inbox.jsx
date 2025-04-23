import React, { useState, useEffect } from 'react';

const ChatApplication = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackChats = [
    { 
      id: '67d338f3f22c60ec8701405a_67d35fd70dd2e0010e615f4b', 
      name: 'Customer Support', 
      lastMessage: 'Y', 
      time: '12:23 PM', 
      unread: 0, 
      avatar: 'https://via.placeholder.com/40',
      branch: 'Lahore' 
    },
    { 
      id: 2, 
      name: 'Fatima Ahmed (Lahore Branch)', 
      lastMessage: 'Did you receive our confirmation SMS?', 
      time: 'Yesterday', 
      unread: 0, 
      avatar: 'https://via.placeholder.com/40',
      branch: 'Lahore' 
    },
    { 
      id: 3, 
      name: 'Support Team', 
      lastMessage: 'Saima: Your refund has been processed', 
      time: 'Yesterday', 
      unread: 5, 
      avatar: 'https://via.placeholder.com/40',
      isGroup: true 
    },
    { 
      id: 4, 
      name: 'Usman Malik (Islamabad Branch)', 
      lastMessage: 'Your requested Honda Civic is available', 
      time: 'Monday', 
      unread: 0, 
      avatar: 'https://via.placeholder.com/40',
      branch: 'Islamabad' 
    },
    { 
      id: 5, 
      name: 'Billing Department', 
      lastMessage: 'Your invoice #PKR-2023-456 is ready', 
      time: 'Sunday', 
      unread: 0, 
      avatar: 'https://via.placeholder.com/40' 
    }
  ];

  // Sample data from the provided JSON
  const sampleChatData = [
    {
      chatId: "67d338f3f22c60ec8701405a_67d35fd70dd2e0010e615f4b",
      messages: [
        {senderId: "67d338f3f22c60ec8701405a", message: "Fff", _id: "67dea3b321694cd76c17780f", timestamp: "2025-03-22T11:49:07.201Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "Uuu", _id: "67dea3c921694cd76c177813", timestamp: "2025-03-22T11:49:29.690Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "Cfff", _id: "67dea49921694cd76c177818", timestamp: "2025-03-22T11:52:57.550Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "Fff", _id: "67dea50404ead4cff8265832", timestamp: "2025-03-22T11:54:44.036Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "Ggg", _id: "67dea82b1893e9a2b7ef9cd5", timestamp: "2025-03-22T12:08:11.570Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "F", _id: "67dea82f1893e9a2b7ef9cdd", timestamp: "2025-03-22T12:08:15.807Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "L", _id: "67dea9a61893e9a2b7ef9ced", timestamp: "2025-03-22T12:14:30.990Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "B", _id: "67deaa7b1893e9a2b7ef9d07", timestamp: "2025-03-22T12:18:03.380Z"},
        {senderId: "67d338f3f22c60ec8701405a", message: "Y", _id: "67deabaf1893e9a2b7ef9d24", timestamp: "2025-03-22T12:23:11.471Z"}
      ]
    }
  ];

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Simulating API call with sample data
        const data = sampleChatData;
        
        // Format the data to match our chat structure
        const formattedChats = data.map(chat => ({
          id: chat.chatId,
          name: 'Customer Support',
          lastMessage: chat.messages[chat.messages.length - 1]?.message || 'No messages',
          time: new Date(chat.messages[chat.messages.length - 1]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          avatar: 'https://via.placeholder.com/40',
          branch: 'Lahore',
          rawMessages: chat.messages
        }));

        setChats(formattedChats);

        if (formattedChats.length > 0) {
          setSelectedChat(formattedChats[0].id);
          // Set the messages for the first chat
          const firstChatMessages = formattedChats[0].rawMessages.map(msg => ({
            id: msg._id,
            sender: msg.senderId === "67d338f3f22c60ec8701405a" ? 'Customer Support' : 'You',
            text: msg.message,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: msg.senderId !== "67d338f3f22c60ec8701405a"
          }));
          setMessages(firstChatMessages);
        }
      } catch (err) {
        setError(err.message || 'An unknown error occurred');
        setChats(fallbackChats);
        setSelectedChat(fallbackChats[0].id);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleSelectChat = (id) => {
    setSelectedChat(id);
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === id ? { ...chat, unread: 0 } : chat
      )
    );
    
    // Load messages for the selected chat
    const selectedChatData = chats.find(c => c.id === id);
    if (selectedChatData && selectedChatData.rawMessages) {
      const formattedMessages = selectedChatData.rawMessages.map(msg => ({
        id: msg._id,
        sender: msg.senderId === "67d338f3f22c60ec8701405a" ? 'Customer Support' : 'You',
        text: msg.message,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: msg.senderId !== "67d338f3f22c60ec8701405a"
      }));
      setMessages(formattedMessages);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    
    const newMsg = {
      id: Date.now().toString(),
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    const selectedChatData = chats.find(c => c.id === selectedChat);
    
    setTimeout(() => {
      const autoReplies = [
        "Thank you for your message. Our representative will respond shortly.",
        "Your query has been noted. For immediate assistance, please call our helpline at 021-111-222-333.",
        "We've received your message. Office hours are 9 AM to 6 PM, Monday to Saturday.",
        "Shukriya for contacting Drive Fleet. How may we assist you further?",
        "Your booking details have been updated. Please check your email for confirmation."
      ];
      
      const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      
      const replyMsg = {
        id: Date.now().toString() + 'reply',
        sender: selectedChatData?.name || 'Customer Support',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false
      };
      
      setMessages(prev => [...prev, replyMsg]);
    }, 2000);
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
        <div className="p-4 bg-green-600 text-white">
          <h1 className="text-xl font-bold">Drive Fleet Pakistan</h1>
          <p className="text-sm">Customer Support</p>
        </div>
        <div className="p-4">
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full p-2 rounded border focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="overflow-y-auto text-black h-full pb-20">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedChat === chat.id ? 'bg-green-50' : ''}`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex items-center">
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className={`font-medium ${chat.unread > 0 ? 'font-bold' : ''}`}>
                      {chat.name}
                      {chat.branch && (
                        <span className="ml-2 text-xs bg-gray-200 px-1 rounded">{chat.branch}</span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center">
              
              <div className="flex-1">
                <h2 className="font-bold">
                  {chats.find(c => c.id === selectedChat)?.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {chats.find(c => c.id === selectedChat)?.branch ? 
                    `${chats.find(c => c.id === selectedChat)?.branch} Branch` : 
                    'Online Support'}
                </p>
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
                      message.isMine ? 'bg-green-600 text-white' : 'bg-white border'
                    }`}>
                      {!message.isMine && (
                        <div className="font-bold text-sm text-black">{message.sender}</div>
                      )}
                      <p className={message.isMine ? 'text-white' : 'text-black'}>{message.text}</p>
                      <div className={`text-xs mt-1 text-right ${
                        message.isMine ? 'text-green-200' : 'text-gray-500'
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
                
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  aria-label="Type your message"
                />
                <button 
                  type="submit" 
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <div className="text-xs text-gray-500 mt-2">
                Our agents typically reply within 15 minutes during business hours (9 AM - 6 PM PKT)
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-gray-500">Select a chat to start messaging</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApplication;