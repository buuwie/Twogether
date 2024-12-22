import { ChatState } from "../../context/ChatProvider";

const UserListItem = ({ user, handleFunction }) => {
    
    return (
      <div
        className="flex chat-click items-center hover:bg-stone-900 gap-1 hover:text-white px-3 py-2 mb-2 rounded-lg cursor-pointer"
        onMouseDown={() => {handleFunction()}}
      >
        <img
          className="mr-2 w-8 h-8 rounded-full cursor-pointer"
          src={user.profileImg || "/avatar-placeholder.png"}
        />
        <div>
          <p className="text-sm text-gray-500">@{user.username}</p>
          <p>
            <b>{user.fullName} </b>
          </p>
        </div>
      </div>
    );
  };

export default UserListItem;
