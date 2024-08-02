import React from "react";
import ChannelSubcribedCards from "./ChannelSubscribedCards";
import { IoIosSearch } from "react-icons/io";

const ChannelSubscribed: React.FC = () => {
	return (
		<div className="grid px-4 mt-4 w-full justify-items-center">
			<div className="flex items-center border-2 border-white rounded-full bg-transparent w-[calc(100%-16px)] mx-auto">
				<input
					type="text"
					placeholder="Search"
					className="outline-none rounded-l-full pl-3 py-1 w-full"
					required
				/>
				<div className="h-full pr-2 pl-1 rounded-r-full bg-white cursor-pointer">
					<IoIosSearch className="text-xl h-full text-primary2" />
				</div>
			</div>
			<ChannelSubcribedCards />
			<ChannelSubcribedCards />
			<ChannelSubcribedCards />
			<ChannelSubcribedCards />
			<ChannelSubcribedCards />
			<ChannelSubcribedCards />
		</div>
	);
};

export default ChannelSubscribed;