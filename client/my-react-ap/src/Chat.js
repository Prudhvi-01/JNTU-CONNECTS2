import React, { useEffect, useState } from "react";
import axios from 'axios';

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const fetchPreviousMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/chats/${room}`);
      setMessageList(response.data);
    } catch (error) {
      console.error("Error fetching previous messages:", error);
    }
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    fetchPreviousMessages();

    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.off("receive_message",handleReceiveMessage);

    return () => {
     
      socket.on("receive_message",handleReceiveMessage);
    };
  }, [socket, room]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>JNTU CONNECTS</p>
      </div>
      <div className="chat-body">
        {messageList.map((messageContent, index) => {
          return (
            <div
              className="message"
              id={username === messageContent.author ? "you" : "other"}
              key={index}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Connect The way You Want..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();  // Prevent default form submission
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}> &#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
