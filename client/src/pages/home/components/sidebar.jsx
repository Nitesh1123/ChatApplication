import { useState } from "react";
import Search from "./search";
import UserList from "./userList";

function Sidebar() {
    const [searchkey, setSearchKey] = useState("");
    
    return(
        <div className="app-sidebar">
            <Search 
            searchkey={searchkey} 
            setSearchKey={setSearchKey} 
           />
            <UserList searchkey={searchkey}/>
        </div>
    )
}

export default Sidebar;