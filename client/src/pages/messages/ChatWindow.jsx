import React, { useEffect, useState, useRef } from 'react';
import { FaArrowLeft } from 'react-icons/fa6';
import { IoMdSend } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';
import { ChatState } from '../../context/ChatProvider';
import { MdMoreVert } from "react-icons/md";
import { getSenderUsername, getSender, getSenderImg } from '../../config/ChatLogics';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client'
import toast from "react-hot-toast"
import Lottie from "react-lottie"
import animationData from "../../animations/typing.json"

const ENDPOINT = "http://localhost:3000";
var socket, selectedChatCompare

export default function ChatWindow({ fetchAgain, setFetchAgain }) {
  const { user, selectedChat, setSelectedChat } = ChatState();

  const [loggedUser, setLoggedUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('')
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef(null)

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true)
      const res = await fetch(`/api/message/${selectedChat._id}`)
      const data = await res.json()
      if (res.ok) {
        setMessages(data);
        setLoading(false);
        socket.emit("join chat", selectedChat._id);
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit("setup", user)
    socket.on("connected", () => setSocketConnected(true))
    socket.on("typing", (userId) => {
      if (userId !== user._id) {
        // console.log("Typing User ID:", userId);
        setIsTyping(true);
      }
    });
    socket.on("stop typing", (typingUserId) => {
      if (typingUserId !== user._id) {
        setIsTyping(false);
      }
    });
  }, [messages, user])

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat])

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // if (!notification.includes(newMessageReceived)) {
        //   setNotification([newMessageReceived, ...notification]);
        //   setFetchAgain(!fetchAgain);
        // }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]); // Thêm tin nhắn mới vào messages
      }
    });
    return () => socket.off("message received");
  }, [messages]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", { room: selectedChat._id, userId: user._id });
      try {
        setNewMessage("")
        const res = await fetch("/api/message", {
          method: "POST",
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
            content: newMessage,
            chatId: selectedChat,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          // console.log(data)
          socket.emit("new message", data);
          setMessages([...messages, data]);
        }
      } catch (error) {
        console.log(error.message)
      }
    }
  }

  // useEffect(() => { 
  //   socket = io(ENDPOINT); 
  //   socket.emit("setup", user); 
  //   // Đổi "connection" thành "connected" 
  //   socket.on("connected", () => setSocketConnected(true)); }, []);

  let typingTimeout;

  const typingHandler = async (e) => {
    setNewMessage(e.target.value)

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      // console.log("Selected chat ID:", selectedChat?._id); 
      // console.log("user see typing:", selectedChat.users.find(u => u._id !== user._id))
      socket.emit("typing", { room: selectedChat._id, userId: user._id });
      // console.log("Is typing: ", isTyping)
    }
    // let lastTypingTime = new Date().getTime();
    // var timerLength = 3000;
    
    // setTimeout(() => {
    //   var timeNow = new Date().getTime();
    //   var timeDiff = timeNow - lastTypingTime;
    //   if (timeDiff >= timerLength && typing) {
    //     socket.emit("stop typing", { room: selectedChat._id, userId: user._id });
    //     setTyping(false);
    //   }
    // }, timerLength);
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      // Khi không còn gõ trong 3 giây, phát tín hiệu "stop typing"
      socket.emit("stop typing", { room: selectedChat._id, userId: user._id });
      setTyping(false); // Dừng trạng thái "đang gõ"
    }, 5000); // Sau 3 giây không gõ, dừng trạng thái "đang gõ"
  }

  useEffect(() => {
    setLoggedUser(user)
    // setLoading(true)
  }, [user])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [isTyping, messages]);

  return (
    <div className={`flex flex-col w-full h-full overflow-hidden`}>
      <div className='flex w-full border-b justify-between border-gray-700'>
        <div className='flex gap-4 p-4'>
            <FaArrowLeft
            className='w-4 h-4 my-auto cursor-pointer'
            onClick={() => setSelectedChat('')}
          />
          {!selectedChat.isGroupChat && (
            <Link to={`/profile/${getSenderUsername(loggedUser, selectedChat.users)}`}>
            <img
              className='w-10 h-10 rounded-full my-auto'
              src={getSenderImg(loggedUser, selectedChat.users) || '/avatar-placeholder.png'}
            />
          </Link>
          )}
          <h2 className='my-auto text-xl font-semibold'>
            {!selectedChat.isGroupChat
                ? getSender(loggedUser, selectedChat.users)
                : selectedChat.chatName}
          </h2>
        </div>
        {selectedChat.isGroupChat && (
          <UpdateGroupChatModal fetchAgain={fetchAgain} fetchMessages={fetchMessages} setFetchAgain={setFetchAgain}>
            <MdMoreVert className='w-6 h-6 mt-5 mr-4' />
          </UpdateGroupChatModal>
        )}
      </div>
      {loading ? (
        <div className='m-auto my-16'>
          <LoadingSpinner size='xl' />
        </div>
      ) : <></>}
      

      {/* Chỉ phần này được phép scroll nếu tin nhắn dài */}
      <div className='flex-grow overflow-y-auto p-4' ref={containerRef}>
        {/* {selectedChat?.messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              message.isOwn ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-2 max-w-xs rounded-lg ${
                message.isOwn ? 'bg-blue-500' : 'bg-gray-300 text-black'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))} */}
        <ScrollableChat messages={messages} />
        {/* {isTyping && selectedChat?.users.find(u => u._id !== user._id) && (
          <Lottie
            options={defaultOptions}
            height={30}
            width={50}
            style={{ marginBottom: 15, marginLeft: 10, marginTop: 10 }}
          />
        )} */}
        {isTyping ? (
          <div>
            <Lottie
              options={defaultOptions}
              height={30}
              width={50}
              style={{ marginBottom: 15, marginLeft: 10, marginTop: 10 }}
            />
          </div>
        ) : (<></>)}
        {/* {isTyping && selectedChat.users[0]._id !== user._id && (
          <Lottie
            options={defaultOptions}
            height={30}
            width={50}
            style={{ marginBottom: 15, marginLeft: 10, marginTop: 10 }}
          />
        )} */}
      </div>

          
            <div className='p-4 flex border-t border-gray-700 gap-4 flex-none'>
              <FaImage className='w-6 h-6 my-auto' />
              
              <input
                type='text'
                placeholder='Type a message...'
                className='w-full p-2 border border-gray-700 rounded-lg'
                onKeyDown={sendMessage}
                onChange={typingHandler}
                value={newMessage}
              />
              <IoMdSend className='w-6 h-6 my-auto hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer' />
            </div>
          
      
    </div>
  );
}
