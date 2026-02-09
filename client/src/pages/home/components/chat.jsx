import { useDispatch, useSelector } from "react-redux";
import { createNewMessage } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { useState } from "react";
import toast from "react-hot-toast";
 
function ChatArea() {
    const dispatch = useDispatch();
    const {selectedChat, user} = useSelector((state) => state.userReducer);
    const selectedUser = selectedChat?.members?.find(u => u._id !== user?._id);
    const [message, setMessage] = useState('');
    const sendMessage = async () => {
        try{
            const newMessage = {
                chat : selectedChat._id,
                sender: user._id,
                text : message
            };
            dispatch(showLoader());
            const response = await createNewMessage(newMessage);
            dispatch(hideLoader());
            if (response?.success) {
                setMessage("");
            }
        }catch(error){
            dispatch(hideLoader());
            toast.error(error.message);
        }
    }
    return <>
            {selectedChat && <div className="app-chat-area">
                <div className="app-chat-area-header">
                    {/* <!--RECEIVER DATA--> */}
                    {selectedUser?.firstname?.[0]?.toUpperCase() + selectedUser?.firstname?.slice?.(1)}{" "}
                    {selectedUser?.lastname?.[0]?.toUpperCase() + selectedUser?.lastname?.slice?.(1)}
                </div>
                <div className="main-chat-area">
                    {/* <!--Chat Area--> */}
                    CHAT AREA
                </div>
               
                <div className="send-message-div">
                    <input
                        type="text"
                        className="send-message-input"
                        placeholder="Type a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        className="fa fa-paper-plane send-message-btn"
                        aria-hidden="true"
                        onClick={() => {
                            if (message.trim()) {
                                sendMessage();
                            }
                        }}
                    ></button>
                </div>
            </div>}
    </>
}
export default ChatArea;
