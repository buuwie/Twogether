import React from 'react'
import dummyImg from "../../assets/images/images.jfif"

export default function MessagesItem({ conversation }) {
    return (
        <div className='flex items-center p-3 mx-4 my-2 hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
          <div className='flex-shrink-0'>
            <img
              className='w-10 h-10 rounded-full'
              src={conversation.userImg || dummyImg}
            />
          </div>
          <div className='ml-3'>
            <div className='flex gap-2'>
              <p className='font-semibold  text-gray-300'>{conversation.fullName}</p>
              <p className=' text-gray-500 text-sm'>{conversation.username}</p>
            </div>
            <p className='text-sm text-gray-600 truncate'>{conversation.lastMessage}</p>
          </div>
        </div>
      );
}
