import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import { USER_STATUS, User } from "@/types/user"
import { SocketEvent } from "@/types/socket"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Code2, Users, Zap, Menu, X } from "lucide-react"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import cn from "classnames"

function EditorPage() {
    // Listen user online/offline status
    useUserActivity()
    // Enable fullscreen mode
    useFullScreen()
    const navigate = useNavigate()
    const { roomId } = useParams()
    const { status, setCurrentUser, currentUser } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()
    const { isSidebarOpen } = useViews()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (roomId) {
            // Prefer the username passed via navigation state, fall back to context
            const username = location.state?.username ?? currentUser.username
            if (username && username.length > 0) {
                const user: User = { username, roomId }
                setCurrentUser(user)
                socket.emit(SocketEvent.JOIN_REQUEST, user)
            } else {
                navigate("/", {
                    state: { roomId },
                })
            }
        }
    }, [
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ])

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <div className="flex h-screen flex-col bg-slate-900">
            {/* Top Navigation Bar */}
            <nav className="fixed left-0 right-0 top-0 z-[60] flex h-[60px] items-center justify-between border-b border-slate-800 bg-slate-800/50 px-3 sm:px-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
                    <span className="text-base sm:text-lg font-semibold text-white">CodeWithUs</span>
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden flex items-center justify-center p-2 rounded-lg bg-slate-800/50 text-slate-300"
                    onClick={toggleMobileMenu}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                
                {/* Desktop Menu Items */}
                <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300">
                        <Users className="h-4 w-4 text-indigo-400" />
                        <span>Room: {roomId}</span>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg bg-slate-800/50 px-3 py-1.5 text-sm text-slate-300">
                        <Zap className="h-4 w-4 text-indigo-400" />
                        <span>Connected</span>
                    </div>
                </div>
                
                {/* Mobile Menu (Dropdown) */}
                {mobileMenuOpen && (
                    <div className="absolute top-[60px] left-0 right-0 bg-slate-800 border-b border-slate-700 p-4 flex flex-col gap-2 md:hidden animate-fade-in">
                        <div className="flex items-center space-x-2 rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-300">
                            <Users className="h-4 w-4 text-indigo-400" />
                            <span>Room: {roomId}</span>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-300">
                            <Zap className="h-4 w-4 text-indigo-400" />
                            <span>Connected</span>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <div className="relative mt-[60px] flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
                <Sidebar />
                {/* Editor Workspace with dynamic margin based on sidebar state */}
                <div 
                    className={cn(
                        "flex-1 overflow-hidden transition-all duration-200 ease-in-out",
                        {
                            "ml-[60px]": !isSidebarOpen,
                            "ml-[380px] md:ml-[380px]": isSidebarOpen && window.innerWidth >= 768,
                            "ml-0 z-0 opacity-30": isSidebarOpen && window.innerWidth < 768
                        }
                    )}
                    style={{
                        pointerEvents: isSidebarOpen && window.innerWidth < 768 ? 'none' : 'auto'
                    }}
                >
                    <WorkSpace />
                </div>
            </div>
        </div>
    )
}

export default EditorPage
