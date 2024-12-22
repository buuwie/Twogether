import React, { useEffect, useRef, useState } from 'react'
import MessagesItem from './MessagesItem';
import UserListItem from './UserSearchResult';
import { ChatState } from '../../context/ChatProvider';
import { useQuery } from '@tanstack/react-query';
import { getSender, getSenderUsername } from '../../config/ChatLogics';

import { MdGroupAdd, MdPersonAddAlt1 } from "react-icons/md";
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import GroupChatModal from './GroupChatModal';

export default function MessagesList({ fetchAgain }) {

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [loggedUser, setLoggedUser] = useState('')

    const inputRef = useRef(null);

    const handleSearch = async (query) => {
      setSearchTerm(query)
      if (!query) {
        setDropdownVisible(false);
        toast.error("Please type something")
        return;
      }
        
      try {
        setLoading(true)
        const res = await fetch(`/api/user/find?search=${searchTerm}`)
        const data = await res.json()
        if (res.ok) {
          setLoading(false)
          setSearchResult(data);
          setDropdownVisible(true);
        }
      } catch (error) {
        toast.error("Can't find this user")
      }
    }

    const fetchChats = async () => {
      try {
        const res = await fetch("/api/chat");
        const data = await res.json()
        if (res.ok) {
          setChats(data)
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    useEffect(() => {
      setLoggedUser(user);
      fetchChats();
    }, [user, fetchAgain])

    const accessChat = async (userId) => {
      console.log(userId);
      try {
        setLoadingChat(true);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({userId})
        });
        const data = await res.json();
        console.log(data)
        if (res.ok) {
          if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
          setSelectedChat(data)
          setLoadingChat(false)
          setDropdownVisible(false)
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    const truncateText = (text, length) => {
      if (text.length <= length) return text;
      return text.substring(0, length) + '...';
    };

    const handleInputBlur = () => {
      setDropdownVisible(false); // Ẩn dropdown khi unfocus
    };

    const handleSingleChatClick = () => {
      inputRef.current.focus(); // Focus vào input khi click vào MdPersonAddAlt1
    };

    return (
        <div className={`md:block border-r w-full h-full border-gray-700`}>
          <div className='flex justify-between w-full my-auto'>
            <h2 className='p-4 text-xl font-semibold mb-6'>Messages</h2>
            <div className='flex flex-row gap-4 mr-4 mt-5 mb-6'>
              {/* Icon for adding a person */}
          <div className="relative group">
            <MdPersonAddAlt1 className='w-6 h-6 cursor-pointer' onClick={handleSingleChatClick} />
            <span className="absolute left-1/2 transform -translate-x-1/2  bg-black text-white text-[10px] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              New Chat
            </span>
          </div>

          {/* Icon for creating a group */}
          <div className="relative group">
            <GroupChatModal>
                <MdGroupAdd className='w-6 h-6 cursor-pointer' />
              <span className="absolute left-1/2 transform -translate-x-1/2  bg-black text-white text-[10px] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                New Group
              </span>
            </GroupChatModal>
            
          </div>
            </div>
          </div>
          <form className="relative w-full">
            <input
              type="text"
              placeholder="Search user to chat"
              value={searchTerm}
              className="w-[90%] mx-4 px-3 py-2 border rounded-full bg-black border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={handleInputBlur}
              ref={inputRef}
            />
            
            {searchResult && dropdownVisible && searchResult.length > 0 && (
              <div className="absolute left-4 w-[90%] mt-1 bg-black border border-gray-700 rounded-lg shadow-lg">
                {loading ? (
                  <div className="p-2 text-white">Loading...</div>
                ) : (
                  searchResult.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => accessChat(user._id)}
                    />
                  ))
                )}
              </div>
            )}
          </form>
          {/* <div className='overflow-y-auto h-screen'>
              {conversations.map((conversation) => (
                <div key={conversation.id} onClick={() => selectConversation(conversation.id)}>
                  <MessagesItem conversation={conversation} />
                </div>
              ))}
          </div>       */}
          {/* Phần này sẽ chứa danh sách các cuộc trò chuyện */}
          <div className="flex-grow overflow-y-auto h-[calc(100vh-140px)]">
            {chats ? (
              <div className=" h-full overflow-y-auto">
                {/* {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation)}
                  >
                    <MessagesItem conversation={conversation} />
                  </div>
                ))} */}
                {chats.map((chat) => (
                  <div key={chat._id} onClick={() => setSelectedChat(chat)}>
                    <div className="flex items-center p-3 mx-4 my-2 hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer">
                      <div className="flex-shrink-0">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={chat.userImg || "/avatar-placeholder.png"}
                        />
                      </div>
                      <div className="ml-3">
                        <div className="flex gap-2">
                          <p className="font-semibold text-gray-300">
                            {!chat.isGroupChat
                              ? getSender(loggedUser, chat.users)
                              : chat.chatName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {!chat.isGroupChat
                              ? `@${getSenderUsername(loggedUser, chat.users)}`
                              : "Group Chat"}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.latestMessage
                            ? truncateText(chat.latestMessage.content, 25)
                            : "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </div>
          
            

          {loadingChat && <LoadingSpinner size='md' />}
        </div>
      );
}
