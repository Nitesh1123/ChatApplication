import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "../../../redux/userSlice";

function UserList({ searchkey }) {
    const { allUsers, allChats, user: currentUser, selectedChat } = useSelector(
        state => state.userReducer
    );
    const dispatch = useDispatch();

    if (!currentUser?._id) return null;

    const startNewChat = async (searchedUserId) => {
        let response = null;
        try {
            dispatch(showLoader());
            response = await createNewChat([currentUser._id, searchedUserId]);
            dispatch(hideLoader());

            if (response.success) {
                toast.success(response.message);
                const newChat = response.data;
                dispatch(setAllChats([...allChats, newChat]));
                dispatch(setSelectedChat(newChat));
            }
        } catch (error) {
            toast.error(error.message || "Something went wrong");
            dispatch(hideLoader());
        }
    };

    const openChat = (selectedUserId) => {
        const chat = allChats.find(chat => {
            const memberIds = (chat?.members || []).map(m =>
                typeof m === "string" ? m : m?._id
            );
            return (
                memberIds.includes(currentUser._id) &&
                memberIds.includes(selectedUserId)
            );
        });

        if (chat) {
            dispatch(setSelectedChat(chat));
        }
    };

    const isSelectedChat = (user) => {
        if(selectedChat){
            return selectedChat.members.map(m => m._id).includes(user._id);
        }
        return false;
    };

    // extract unique chat users (chat list style)
    const chatUsers = allChats
        .map(chat =>
            (chat?.members || []).find(
                m => (typeof m === "object" ? m?._id : m) !== currentUser._id
            )
        )
        .filter(Boolean)
        .filter(
            (u, i, arr) => arr.findIndex(x => x?._id === u?._id) === i
        );

    let searchResults = [];

    if (searchkey?.trim()) {
        const key = searchkey.toLowerCase().trim();

        const searchedUsers = allUsers.filter(u =>
            u._id !== currentUser._id &&
            (
                u.firstname.toLowerCase().startsWith(key) ||
                u.lastname.toLowerCase().startsWith(key)
            )
        );

        searchResults = searchedUsers;
    }

    // chat users always shown first
    const displayedUsers = [
        ...chatUsers,
        ...searchResults.filter(
            u => !chatUsers.find(cu => cu._id === u._id)
        )
    ];

    if (displayedUsers.length === 0) {
        return (
            <div className="user-search-filter">
                <div className="filtered-user">
                    <div className="filter-user-display">
                        <div className="filter-user-details">
                            <div className="user-display-name">
                                {searchkey
                                    ? "No matching users found"
                                    : "No chats yet. Search to start chatting!"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {displayedUsers.map(user => {
                const hasChat = chatUsers.find(u => u._id === user._id);
                const isFromSearch = searchResults.find(u => u._id === user._id);

                return (
                    <div
                        className="user-search-filter"
                        key={user._id}
                        onClick={() => openChat(user._id)}
                    >
                        <div className={ isSelectedChat(user) ? "selected-user" : "filtered-user"} >
                            <div className="filter-user-display">
                                {user.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt="Profile"
                                        className="user-profile-image"
                                    />
                                ) : (
                                    <div className="user-default-avatar">
                                        {user.firstname[0].toUpperCase()}
                                        {user.lastname[0].toUpperCase()}
                                    </div>
                                )}

                                <div className="filter-user-details">
                                    <div className="user-display-name">
                                        {user.firstname[0].toUpperCase() + user.firstname.slice(1)}{" "}
                                        {user.lastname[0].toUpperCase() + user.lastname.slice(1)}
                                    </div>
                                    <div className="user-display-email">
                                        {user.email}
                                    </div>
                                </div>

                                {isFromSearch && !hasChat && (
                                    <div className="user-start-chat">
                                        <button
                                            className="user-start-chat-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startNewChat(user._id);
                                            }}
                                        >
                                            Start Chat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default UserList;
