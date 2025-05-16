import { useChatStore } from "../../store/chatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../../skeletons/MessageSkeleton";
import { useAuthStore } from "../../store/authStore";
import { formatMessageTime } from "../../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { user ,socket} = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser && socket) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      return () => unsubscribeFromMessages();
    }
  }, [selectedUser?._id, socket]);
  
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => {
          const isSender = message.senderId === user._id;
          const displayName = isSender ? user.name : selectedUser?.name || "U";

          return (
            <div
              key={message._id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              <div className={`flex items-end space-x-2 ${isSender ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow">
                  {displayName.charAt(0).toUpperCase()}
                </div>

                <div>
                  {/* Timestamp */}
                  <div
                    className={`text-xs text-gray-400 mb-1 ${isSender ? "text-right" : "text-left"
                      }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>

                  {/* Chat Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-xs sm:max-w-md break-words shadow-md ${isSender
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 rounded-bl-none"
                      }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
