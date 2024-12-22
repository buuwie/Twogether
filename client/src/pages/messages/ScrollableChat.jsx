import React, { useRef, useEffect } from 'react'
import ScrollableFeed from "react-scrollable-feed"
import { ChatState } from '../../context/ChatProvider'
import { 
    isSameSender,
    isLastMessage,
    isSameSenderMargin,
    isSameUser,

 } from '../../config/ChatLogics'

export default function ScrollableChat({messages}) {

    const { user } = ChatState()
    const messagesEndRef = useRef(null) // Tham chiếu đến vị trí cuối feed

    useEffect(() => {
        // Cuộn đến cuối mỗi khi messages thay đổi
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages]) // Chạy lại khi messages thay đổi

    return (
        <ScrollableFeed className="overflow-y-auto h-full">
            {messages &&
                messages.map((m, i) => (
                    <div className="flex" key={m._id}>
                    {(isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
                        <div className="relative group">
                        <img
                            className="w-8 h-8 mt-2 mr-1 rounded-full cursor-pointer"
                            src={m.sender.profileImg || "/avatar-placeholder.png"}
                            title={m.sender.userame} 
                        />
                        <span className="absolute hidden group-hover:block text-xs bg-black text-white p-1 rounded opacity-75">
                            {m.sender.fullName}
                        </span>
                        </div>
                    )}
                    <span
                        className={`rounded-2xl p-2 max-w-[75%] ${m.sender._id === user._id ? 'bg-blue-500' : 'bg-gray-300 text-black'}`}
                        style={{
                        marginLeft: isSameSenderMargin(messages, m, i, user._id),
                        marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                        wordWrap: 'break-word',
                        }}
                    >
                        {m.content}
                    </span>
                    </div>
            ))}
            <div ref={messagesEndRef} />
        </ScrollableFeed>
    )
}
