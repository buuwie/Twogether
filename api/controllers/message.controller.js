import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Content and chatId are required." });
    }

    const newMessage = {
      sender: req.user._id, // Giả sử bạn có middleware để xác định user hiện tại
      content: content,
      chat: chatId,
    };

    try {
      // Tạo message mới
      let message = await Message.create(newMessage);

      // Sau khi tạo tin nhắn, dùng findById để lấy lại và populate các trường cần thiết
      message = await Message.findById(message._id)
        .populate("sender", "fullName profileImg")
        .populate("chat");

      // Populate thêm thông tin về người dùng trong chat
      message = await User.populate(message, {
        path: "chat.users",
        select: "fullName profileImg username",
      });

      // Update chat để lưu lại tin nhắn cuối cùng (lastMessage)
      await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

      // Trả về message đã gửi
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

export const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
          .populate("sender", "fullName profileImg username")
          .populate("chat");
        res.json(messages);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
}