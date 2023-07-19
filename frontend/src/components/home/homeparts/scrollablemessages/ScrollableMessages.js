import React, { useEffect, useRef } from "react";
import "./ScrollableMessages.css";
import ScrollableFeed from "react-scrollable-feed";
import { UseGlobalContext } from "../../../context/Context";

const ScrollableMessages = ({ messages }) => {

  const { user } = UseGlobalContext();
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollableFeed>
      {messages &&
  Array.isArray(messages) &&
  messages.map((message, index) => (
    <div
      className={
        message?.sender && message?.sender?._id === user?._id
          ? "messageRight"
          : "messageLeft"
      }
      key={index}
    >
      {message?.sender && message?.sender?._id === user?._id ? (
        <div
          className="messageRightContent"
          style={{ wordBreak: "break-all" }}
        >
          {" "}
          {message?.content}
        </div>
      ) : (
        <>
           {(index === 0 && (messages[1]?.sender?._id !== messages[0]?.sender?._id || messages[1]?.sender?._id === undefined ) ) ||
          ((messages[index + 1]?.sender?._id  !==
            messages[index]?.sender?._id ) || messages[index + 1]?.sender?._id === undefined) ? (
            <img
              className="imgOfSender"
              src={message?.sender?.profileDP || ''}
              alt=""
            />
          ) : (
            <div className="imgOfSenderNone"></div>
          )}
          <div
            className="messageLeftContent"
            style={{ wordBreak: "break-all" }}
          >
            {message?.content}
          </div>
        </>
      )}
    </div>
  ))}

      {/* this is a self closing div / is at lat */}
      <div ref={messagesEndRef} />
    </ScrollableFeed>
  );
};

export default ScrollableMessages;
