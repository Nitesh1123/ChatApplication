import { useSelector } from "react-redux";

function Header() {
    const user = useSelector(state => state.userReducer.user);
    
    function getFullname(){
        if (!user) return "Loading...";
        const fname = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        const lname = user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
        return `${fname} ${lname}`;
    }

    function getInitials(){
        if (!user) return "??";
        const f = user.firstname.charAt(0).toUpperCase();
        const l = user.lastname.charAt(0).toUpperCase();
        return f + l;
    }
    return(
        <div className="app-header">
            <div className="app-logo">
                <i className="fa fa-comments" aria-hidden="true"></i>
                Quick Chat
                </div>
            <div className="app-user-profile">
                <div className="logged-user-name">{getFullname()}</div>
                <div className="logged-user-profile-pic">{getInitials()}</div>
            </div>
        </div>
    )

}


export default Header;