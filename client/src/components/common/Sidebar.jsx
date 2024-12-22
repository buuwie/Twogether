import { useState, useEffect } from "react";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaMessage } from "react-icons/fa6"
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { MdPeopleAlt } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MdMeetingRoom } from "react-icons/md";

import logoImg from "../../assets/images/Artboard_6.png"
import logoText from "../../assets/images/Artboard_3_copy.png"

import XSvg from "../svg/X";

export default function Sidebar() {
    // const data = {
	// 	fullName: "John Doe",
	// 	username: "johndoe",
	// 	profileImg: "/avatars/boy1.png",
	// };

	const queryClient = useQueryClient();
	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Logout successfully")
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error("Logout failed");
		},
	});
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const [imageSrc, setImageSrc] = useState(logoText);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setImageSrc(logoImg);
			} else {
				setImageSrc(logoText);
			}
		};

		// Gọi hàm ngay khi component mount
		handleResize();

		// Lắng nghe sự kiện resize
		window.addEventListener('resize', handleResize);

		// Xóa sự kiện khi component unmount
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<div className='md:flex-[2_2_0] w-18 max-w-60 min-h-screen'>
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				<Link to='/' className='flex justify-center md:justify-start'>
                <img src={imageSrc} className='px-1 py-1 md:max-w-40 md:max-h-40 max-w-12 max-h-12 mx-auto mt-2 items-center fill-white' />
				</Link>
				<ul className='flex flex-col gap-3 mt-4 ml-2 mr-2'>
					<li className='flex justify-center md:justify-start hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
						<Link
							to='/'
							className='flex gap-3 items-center py-2 pl-2 pr-2 max-w-fit '
						>
							<MdHomeFilled className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center py-2 pl-2 pr-2 max-w-fit'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
						<Link
							to={`/profile/${authUser?.username}`}
							className='flex gap-3 items-center py-2 pl-2 pr-2 max-w-fit'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
						<Link
							to='/messages'
							className='flex gap-3 items-center py-2 pl-2.5 pr-2 max-w-fit '
						>
							<FaMessage className='w-5 h-5' />
							<span className='text-lg hidden md:block'>Messages</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
						<Link
							to='/'
							className='flex gap-3 items-center py-2 pl-2 pr-2 max-w-fit '
						>
							<MdPeopleAlt className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Communities</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start hover:bg-stone-900 transition-all rounded-full duration-300 cursor-pointer'>
						<Link
							to='/'
							className='flex gap-3 items-center py-2 pl-2 pr-2 max-w-fit '
						>
							<MdMeetingRoom className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Meet</span>
						</Link>
					</li>
				</ul>
				{authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full mx-2'
					>
						<div className='avatar hidden md:inline-flex my-auto'>
							<div className='w-8 rounded-full'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{authUser?.username}</p>
							</div>
							<BiLogOut className='w-5 h-5 cursor-pointer my-auto md:mx-0 mx-auto' 
							onClick={(e) => {
								e.preventDefault();
								logout();
							}}
							 />
						</div>
					</Link>
				)}
			</div>
		</div>
	);
}
