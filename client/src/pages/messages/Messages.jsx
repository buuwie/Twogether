import React, { useState } from 'react'
import MessagesList from './MessagesList'
import ChatWindow from './ChatWindow'

import maleImg from "../../assets/images/dummy-profile-image-male.jpg"
import femaleImg from "../../assets/images/dummy-profile-image-female-780x780.jpg"
import { ChatState } from '../../context/ChatProvider'

export default function Messages() {

  const { selectedChat, setSelectedChat } = ChatState()
  const [fetchAgain, setFetchAgain] = useState(false)
    const conversationsData = [
        {
          id: 1,
          username: 'John Doe',
          userImg: maleImg,
          lastMessage: 'Hey, how are you?',
          messages: [
            { text: 'Hey, how are you?', isOwn: false },
            { text: 'I’m good, thanks! You?', isOwn: true },
          ],
        },
        {
          id: 2,
          username: 'Jane Smith',
          userImg: femaleImg,
          lastMessage: 'Let’s catch up later!',
          messages: [
            { text: 'Let’s catch up later!', isOwn: false },
            { text: 'Sure, sounds good!', isOwn: true },
          ],
        },
      ];

      const [selectedConversationId, setSelectedConversationId] = useState(null);

  const selectedConversation = conversationsData.find(
    (conversation) => conversation.id === selectedConversationId
  );

  return (
    <div className='flex h-screen w-full overflow-hidden'>
      {/* Left panel: List of conversations */}
      <div className={`${
        selectedChat ? 'hidden md:block' : 'none'
      } md:w-1/3 w-full h-screen`}>
        <MessagesList
          fetchAgain={fetchAgain}
        />
      </div>

      {/* Right panel: Chat window */}
      <div className={`${
        selectedChat ? 'none' : 'hidden md:flex'
      } md:w-2/3 w-full h-full border-r border-gray-700`}>
        {selectedChat ? (
          <ChatWindow fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          // <div>something</div>
        ) : (
          <div className='flex justify-center items-center w-full h-full'>
            <p className='text-gray-400 justify-center'>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
