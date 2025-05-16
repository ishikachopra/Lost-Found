import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useItemStore } from "../../store/itemStore"
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NoChatSelected from "./NoChatSelected";
import ChatContainer from "./ChatContainer";
import LoadingSpinner from "../../components/LoadingSpinner";

const Chatpg = () => {
    const { selectedUser } = useChatStore();
    const { user ,checkAuth,isCheckingAuth} = useAuthStore();
    const { itemId } = useParams();
    const {isAdmin,access}=useItemStore();
    // const [access,setAccess]=useState(false);

    useEffect(() => {
        if (itemId) {
            isAdmin(itemId); // Fetch access rights based on itemId
            // setAccess(true);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !user)
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner/>
            </div>
        );


    return (
        <>
        {user? 
                <div className="h-screen bg-base-200">
                    <div className="flex items-center justify-center pt-7 px-4">
                        <div className="bg-base-100 rounded-lg shadow-cl w-full h-[calc(100vh-3rem)]">
                            <div className="flex h-full rounded-lg overflow-hidden">
                                {access && <Sidebar />}

                                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
                            </div>
                        </div>
                    </div>
                </div> 
            :
            <h1> Access denied , login first</h1>}
        
        </>
    );
};
export default Chatpg;
