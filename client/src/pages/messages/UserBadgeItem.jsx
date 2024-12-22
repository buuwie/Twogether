import { IoClose } from "react-icons/io5";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <div
      className="flex items-center bg-purple-500 text-white px-2 py-1 rounded-lg m-1 mb-2 cursor-pointer"
      onClick={handleFunction()}
    >
      <span className="text-sm">{user.username}</span>
      {admin === user._id && <span className="text-sm ml-1">(Admin)</span>}
      <IoClose className="ml-1 cursor-pointer" />
    </div>
  );
};

export default UserBadgeItem;