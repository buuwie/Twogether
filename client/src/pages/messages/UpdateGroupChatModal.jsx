import { useState } from "react";
import { ChatState } from "../../context/ChatProvider";
import { IoClose } from "react-icons/io5";
import UserListItem from "./UserSearchResult";
import toast from "react-hot-toast";

export default function UpdateGroupChatModal({ children, fetchMessages, fetchAgain, setFetchAgain }) {
  
    const { selectedChat, setSelectedChat, user } = ChatState()

    const [isOpen, setIsOpen] = useState(false);
    const [groupChatName, setGroupChatName] = useState();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const [dropdownVisible, setDropdownVisible] = useState(false)

    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

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
    

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast.error("Only admin can remove member")
            return;
          }

          try {
            setLoading(true)
            const res = await fetch("/api/chat/groupRemove", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chatId: selectedChat._id,
                    userId: user1._id,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
                setSelectedChat(data);
                setFetchAgain(!fetchAgain);
                setLoading(false);
                fetchMessages();
            }
        } catch (error) {
            console.log(error.message)
            setLoading(false)
        }
        setGroupChatName("");
    }
    
    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true)
            const res = await fetch("/api/chat/rename", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chatId: selectedChat._id,
                    chatName: groupChatName,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setSelectedChat(data)
                setFetchAgain(!fetchAgain);
                setRenameLoading(false)
            }
        } catch (error) {
            console.log(error.message)
            setRenameLoading(false)
        }
        setGroupChatName("")
    }

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast.error("User already in group chat")
            return;
          }
          if (selectedChat.groupAdmin._id !== user._id) {
            toast.error("Only admin can add someone")
            return;
          }

        try {
            setLoading(true)
            const res = await fetch("/api/chat/groupAdd", {
                method: "PUT",
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chatId: selectedChat._id,
                    userId: user1._id,
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setSelectedChat(data);
                setFetchAgain(!fetchAgain);
                setLoading(false);
            }
        } catch (error) {
            console.log(error.message)
            setLoading(false)
        }
        setGroupChatName("");
    }

    const handleInputBlur = () => {
        setDropdownVisible(false); // Ẩn dropdown khi unfocus
      };
  
    return (
    <>
        <span onClick={onOpen}>{children}</span>
        {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 w-full max-w-md rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-2xl font-semibold text-center w-full">{selectedChat.chatName}</h2>
              <button onClick={onClose} className="text-xl font-bold">&times;</button>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap pb-3 w-full">
                {selectedChat.users.map((user) => (
                  <>
                  <div
                      key={user._id}
                      className="px-2 py-1 flex gap-1 bg-black rounded-md cursor-pointer text-sm text-white"
                      onClick={() => handleRemove(user)}>
                  @{user.username} <IoClose className='w-3 h-3 my-auto' onClick={() => handleRemove(user)}/>
                  </div>
                  
              </>
                ))}
              </div>

              <div className="flex mb-3">
                <input
                  type="text"
                  placeholder="Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  onClick={handleRename}
                  disabled={renameLoading}
                  className={`ml-2 p-2 text-white bg-teal-500 rounded-md ${renameLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {renameLoading ? "Loading..." : "Update"}
                </button>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Add User to group"
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  onBlur={handleInputBlur}
                />
              </div>
              {searchResult && dropdownVisible && searchResult.length > 0 && (
              <div className="absolute  w-[37%] bg-black border border-gray-700 rounded-lg shadow-lg">
                {loading ? (
                  <div className="p-2 text-white">Loading...</div>
                ) : (
                  searchResult?.slice(0, 4).map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => {handleAddUser(user)}}
                    />
                  ))
                )}
              </div>
            )}
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => handleRemove(user)}
                className="p-2 text-white bg-red-500 rounded-md"
              >
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
