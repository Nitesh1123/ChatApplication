import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedUser, getAllUsers } from "../apiCalls/users";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../redux/loaderSlice";
import { setUser, setAllUsers, setAllChats } from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";
import toast from "react-hot-toast";

function ProtectedRoute({children}) {
    const user = useSelector(state => state.userReducer.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getLoggedInUser = async() =>{
        let response = null;
        try{
            dispatch(showLoader());
            response = await getLoggedUser();
            dispatch(hideLoader());

            if(response.success){
                dispatch(setUser(response.data));
                console.log(response.data); 
            }else{
                toast.error(response.message);
                navigate('/login');
            }
        }catch(error){
            dispatch(hideLoader());
            navigate('/login');
        }
    }

    const getAllUsersData = async() =>{
        let response = null;
        try{
            dispatch(showLoader());
            response = await getAllUsers();
            dispatch(hideLoader());

            if(response.success){
                dispatch(setAllUsers(response.data));
                console.log(response.data); 
            }else{
                toast.error(response.message);
            }
        }catch(error){
            dispatch(hideLoader());
            toast.error("Failed to fetch users");
        }
    }

    const getCurrentUserChats = async() =>{
           try{
            const response = await getAllChats();
            if(response.success){
                dispatch(setAllChats(response.data))
            }
        }catch(error){
            navigate('/login');
        }
    }
    
    useEffect(() => {
        if(localStorage.getItem('token')){
            getLoggedInUser();
            getAllUsersData();
            getCurrentUserChats();
        }else{
            navigate('/login')
        }
    }, []);
    return(
        <div>
            {/* <p>Name: {user?.firstname + ' ' + ' ' + user?.lastname}</p>
            <p>Email: {user?.email}</p>
            <br /> */}
            {children}
        </div>
    )
}

export default ProtectedRoute;