import React, {useState} from 'react'
import UserListItem from './UserSearchResult';
import UserBadgeItem from './UserBadgeItem';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { ChatState } from '../../context/ChatProvider';

export default function GroupChatModal({ children }) {
    const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearchTerm(query);
    if (!query) {
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
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
        toast.error("User already added")
        return;
      }
  
      setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
        toast.error("Please fill all the fields")
        return;
      }

      try {
        const res = await fetch("/api/chat/group", {
            method: "POST",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
            }),
        })
        const data = await res.json()
        console.log(data)
        if (res.ok) {
            setChats([data, ...chats]);
            onClose();
            toast.success("New Group Chat Created!")
        }
      } catch (error) {
        console.log(error.message)
      }
  };

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  const handleInputBlur = () => {
    setDropdownVisible(false); // Ẩn dropdown khi unfocus
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
          <div className="relative bg-gray-900 w-full max-w-lg mx-auto rounded-lg shadow-lg">
            <div className="px-4 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-center">Create Group Chat</h2>
              <button className="absolute top-1 right-3 text-xl font-semibold text-gray-300" onClick={onClose}>
                &times;
              </button>
            </div>
            <div className="px-4 py-5 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Chat Name"
                  className="w-full px-3 py-2 border rounded-md mb-3"
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Add Users eg: John, Jane, ..."
                  className="w-full px-3 py-2 border rounded-md mb-3"
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={handleInputBlur}
                />
                {searchResult && dropdownVisible && searchResult.length > 0 && (
              <div className="absolute left-4 w-[94%] bg-black border border-gray-700 rounded-lg shadow-lg">
                {loading ? (
                  <div className="p-2 text-white">Loading...</div>
                ) : (
                  searchResult?.slice(0, 4).map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => {handleGroup(user)}}
                    />
                  ))
                )}
              </div>
            )}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                    <>
                        <div
                            key={user._id}
                            className="px-2 py-1 flex gap-1 bg-black rounded-md cursor-pointer text-sm text-white"
                            onClick={() => handleDelete(user)}>
                        @{user.username} <IoClose className='w-3 h-3 my-auto' onClick={() => handleDelete(user)}/>
                        </div>
                        
                    </>
                  
                ))}
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-900 border-t-2 border-gray-500 text-right">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={handleSubmit}>
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
