import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessage } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
 
function ChatArea() {
    const dispatch = useDispatch();
    const {selectedChat, user} = useSelector((state) => state.userReducer);
    const selectedUser = selectedChat?.members?.find(u => u._id !== user?._id);
    const [message, setMessage] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const lastFetchedChatIdRef = useRef(null);


    const sendMessage = async () => {
        try{
            const newMessage = {
                chatId : selectedChat._id,
                sender: user._id,
                text : message
            };
            console.log('Sending message:', newMessage);
            dispatch(showLoader());
            const response = await createNewMessage(newMessage);
            dispatch(hideLoader());
            console.log('Send response:', response);
            if (response?.success) {
                setMessage("");
                // Refresh messages after sending
                await getMessage();
            }else{
                toast.error(response?.message || "Failed to send message");
            }
        }catch(error){
            dispatch(hideLoader());
            toast.error(error.message);
        }
    }

    const formatTime = (timestamp) => {
        const now = moment();
        const diff = now.diff(moment(timestamp), 'days');

        if(diff < 1){
            return `Today ${moment(timestamp).format('hh:mm A')}`;
        }else if(diff === 1){
            return `Yesterday ${moment(timestamp).format('hh:mm A')}`;
        }else{
            return moment(timestamp).format('MMM D, hh:mm A');
        }
    }
 
    const getMessage = async () => {
        try{
            console.log('Fetching messages for chat:', selectedChat._id);
            dispatch(showLoader());
            const response = await getAllMessage(selectedChat._id);
            dispatch(hideLoader());
            console.log('Messages response:', response);

            if (response?.success) {
                setAllMessages(response?.data || []);
                console.log('Messages set:', response?.data);
            }else{
                console.log('Failed to fetch messages:', response?.message);
                toast.error(response?.message || "Failed to fetch messages");
            }
        }catch(error){
            dispatch(hideLoader());
            console.error('Error fetching messages:', error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (!selectedChat?._id) {
            return;
        }
        if (lastFetchedChatIdRef.current === selectedChat._id) {
            return;
        }
        lastFetchedChatIdRef.current = selectedChat._id;
            getMessage();
    }, [selectedChat?._id, dispatch]);

    return <>
            {selectedChat && <div className="app-chat-area">
                <div className="app-chat-area-header">
                    {/* <!--RECEIVER DATA--> */}
                    {selectedUser?.firstname?.[0]?.toUpperCase() + selectedUser?.firstname?.slice?.(1)}{" "}
                    {selectedUser?.lastname?.[0]?.toUpperCase() + selectedUser?.lastname?.slice?.(1)}
                </div>
                <div className="main-chat-area">
                    {allMessages.map(msg => {
                        const isCurrentUserSender = msg.sender === user._id;
                        return <div className="message-container"
                         style={ isCurrentUserSender ?
                          { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }}>
                            <div>
                                <div className={isCurrentUserSender ? 'send-message' : 'received-message'}>
                                    {msg.text}
                                </div>
                                <div className="message-timestamp" style={isCurrentUserSender ? {float : 'right'} : {float : 'left'}}>
                                    {formatTime(msg.createdAt)}
                                </div>
                            </div>
                        </div>
                    })}

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
