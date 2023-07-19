import React, { useEffect, useState } from "react";
import { UseGlobalContext } from "../../context/Context";

const NotificationInMyChat = ({ chat }) => {
  const { user, messages, chats, setchats, notification } = UseGlobalContext();
  const [totalNotifications, setTotalNotifications] = useState(0);

  // it is used for realtime in mychats (for latestmessage but it only work for selectedchat because it have messages value are selectedchat messages).
  useEffect(() => {
    if (messages) {
      let latestMessage = chats.map((chat) => {
        if (chat?._id === messages[messages.length - 1]?.chat?._id) {
          let messn = messages[messages.length - 1];
          return {
            ...chat,
            latestMessage: messn,
          };
        } else {
          return chat;
        }
      });
      setchats(latestMessage);
    }
  }, [messages]);

  // this show latest message in the my chat section when you dont select any chat.
  useEffect(() => {
    if (notification) {
      let updatedChat = null;
      let latestMessage = chats.map((chat) => {
        if (chat?._id === notification[0]?.chat?._id) {
          let mess = chat?.latestMessage;
          let messn = notification[0];
          updatedChat = {
            ...chat,
            latestMessage: messn,
          };
          return updatedChat; // return the updated chat object
        } else {
          return chat;
        }
      });
      if (updatedChat) {
        latestMessage = [updatedChat, ...latestMessage.filter((chat) => chat._id !== updatedChat._id)]; // add the updated chat object at the beginning filter is used to remove same chat which is located at previous position.
      }
      setchats(latestMessage);
      // set the total notifications count
      setTotalNotifications(
        notification.filter((n) => n.chat._id === chat._id).length
      );
    }
  }, [notification]);
  

  return (
    <div>
      <div className="handleNotification" style={{ fontSize: "15px" }}>
        {chat?.latestMessage?.sender?._id === user?._id ? "you " : " "}

        {notification.length === 0 ? (
          ""
        ) : (
          <span
            className="notificationInMyChat"
            style={{ backgroundColor: "transparent" }}
          >
            {notification.some((n) => n.chat._id === chat._id && n.new)
              ? ""
              : notification.filter((n) => n.chat._id === chat._id && !n.new)
                  .length > 0
              ? "new"
              : ""}

            <div
              className={totalNotifications > 0 ? "" : "forNotDisplayingLength"}
            >
              {totalNotifications}
            </div>
          </span>
        )}
        <div className="messagesContent">
          :&nbsp;{chat?.latestMessage?.content}
        </div>
      </div>
    </div>
  );
};

export default NotificationInMyChat;
