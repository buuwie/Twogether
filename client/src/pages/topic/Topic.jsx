import React, { useEffect, useState } from 'react'
import Posts from '../../components/common/Posts'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

export default function Topic() {

    const [feedType, setFeedType] = useState("topic")
    const { topicId } = useParams();
    const [topic, setTopic] = useState();

    const topicName = async () => {
        try {
            const res = await fetch(`/api/post/hashtag/${topicId}`);
            const data= await res.json()
            if (res.ok) {
                console.log(data)
                setTopic(data.name)
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        
        topicName()
        
    },[topic])

    // useEffect(() => {
    //     refetch()
    // })

  return (
    <div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen'>
        <div className='flex w-full border-b border-gray-700 h-14'>
            <div className='flex gap-7 my-auto ml-5'>
                <Link to='/' className='my-auto'>
                    <FaArrowLeft className='w-4 h-4' />
                </Link>
                <div className='font-semibold text-lg my-auto'>
                    #{topic}
                </div>
                
            </div>
            
        </div>
        <Posts feedType={feedType} topicId={topicId} />
        
        
    </div>
  )
}
