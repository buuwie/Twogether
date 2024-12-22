import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";

export default function RightPanel() {
    const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/user/suggested");
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { data: suggestedMayKnownUsers, isLoadingMayKnown } = useQuery({
		queryKey: ["suggestedMayKnownUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/user/suggestedFromFollowersOrFollowing");
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
	});

	const { follow, isPending } = useFollow();

	if (suggestedUsers?.length === 0) return <div className='md:w-64 w-0'></div>;
	if (suggestedMayKnownUsers?.length === 0) return <div className='md:w-64 w-0'></div>;

	return (
		<div className='hidden lg:block max-w-96 my-4 mx-10'>
			<div className='flex flex-col gap-5 sticky top-2'>
				{/* Div đầu tiên */}
				<div className='bg-[#16181C] p-4 rounded-md'>
					<p className='font-bold'>Who to follow</p>
					<div className='flex flex-col gap-4 mt-2'>
						{isLoading && (
							<>
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
							</>
						)}
						{!isLoading &&
							suggestedUsers?.map((user) => (
								<Link
									to={`/profile/${user.username}`}
									className='flex items-center justify-between gap-4'
									key={user._id}
								>
									<div className='flex gap-2 items-center'>
										<div className='avatar'>
											<div className='w-8 rounded-full'>
												<img src={user.profileImg || "/avatar-placeholder.png"} />
											</div>
										</div>
										<div className='flex flex-col'>
											<span className='font-semibold tracking-tight truncate w-28'>
												{user.fullName}
											</span>
											<span className='text-sm text-slate-500'>@{user.username}</span>
										</div>
									</div>
									<div>
										<button
											className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
											onClick={(e) => {
												e.preventDefault();
												follow(user._id);
											}}
										>
											{isPending ? <LoadingSpinner size='sm' /> : "Follow"}
										</button>
									</div>
								</Link>
							))}
					</div>
				</div>

				{/* Div thứ hai */}
				<div className='bg-[#16181C] p-4 rounded-md'>
					<p className='font-bold'>People you may know</p>
					<div className='flex flex-col gap-4 mt-2'>
						{isLoadingMayKnown && (
							<>
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
								<RightPanelSkeleton />
							</>
						)}
						{!isLoadingMayKnown &&
							suggestedMayKnownUsers?.map((user) => (
								<Link
									to={`/profile/${user.username}`}
									className='flex items-center justify-between gap-4'
									key={user._id}
								>
									<div className='flex gap-2 items-center'>
										<div className='avatar'>
											<div className='w-8 rounded-full'>
												<img src={user.profileImg || "/avatar-placeholder.png"} />
											</div>
										</div>
										<div className='flex flex-col'>
											<span className='font-semibold tracking-tight truncate w-28'>
												{user.fullName}
											</span>
											<span className='text-sm text-slate-500'>@{user.username}</span>
										</div>
									</div>
									<div>
										<button
											className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
											onClick={(e) => {
												e.preventDefault();
												follow(user._id);
											}}
										>
											{isPending ? <LoadingSpinner size='sm' /> : "Follow"}
										</button>
									</div>
								</Link>
							))}
					</div>
				</div>
			</div>
		</div>
	);
}
