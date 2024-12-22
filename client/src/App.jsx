import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import Login from "./pages/auth/login/Login"
import SignUp from "./pages/auth/signup/SignUp"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Topic from "./pages/topic/Topic"
import Messages from "./pages/messages/Messages"

function App() {
	const location = useLocation();
  	const { data: authUser, isLoading } = useQuery({
		// we use queryKey to give a unique name to our query and refer to it later
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log("authUser is here:", data);
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}
  return (
    <div className='flex max-w-7xl mx-auto'>
			{/* Common component, bc it's not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <Login /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUp /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
				<Route path='/topics/:topicId' element={authUser ? <Topic /> : <Navigate to='/login' />}/>
				<Route path='/messages' element={authUser ? <Messages /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && location.pathname !== "/messages" && <RightPanel />}
			<Toaster />
		</div>
  )
}

export default App
