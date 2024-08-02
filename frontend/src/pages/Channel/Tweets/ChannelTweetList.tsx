import React from "react";
import thumbnail from "../../../assets/thumbnail.png";
import { Link } from "react-router-dom";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";
import { BiSolidDislike } from "react-icons/bi";
import { BiCommentDetail } from "react-icons/bi";

const ChannelTweetList: React.FC = () => {
	const [readMore, setReadMore] = React.useState(false);
	const [isliked, setIsLiked] = React.useState(false);
	const [isDisliked, setIsDisliked] = React.useState(false);
	const UploadedAt = "1 month";
	const channelName = "Channel Name";
	const dislikes = 100;
	const likes = 100;
	const comments = 100;
	// store 100 words in description
	const description =
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
	const desc = readMore ? description : `${description.slice(0, 100)}...`;

	const likeHanlder = () => {
		setIsLiked(!isliked);
		setIsDisliked(false);
	};
	const dislikeHanlder = () => {
		setIsDisliked(!isDisliked);
		setIsLiked(false);
	};

	return (
		<div className="flex items-start gap-2 p-2 w-full">
			<Link to="/register">
				<div className="overflow-hidden rounded-full w-10">
					<img
						src={thumbnail}
						alt="thumbnail"
						className="rounded-full w-10 aspect-square"
					/>
				</div>
			</Link>
			<div className="flex flex-col text-white w-full">
				<div className="flex gap-2 items-center mb-2">
					<p className="text-sm font-semibold">{channelName}</p>
					<p className="text-primary-text2 text-xs">{UploadedAt}</p>
				</div>
				<div className="flex flex-col items-start">
					<p>{desc}</p>
					{description.length > 100 && (
						<button
							onClick={() => setReadMore(!readMore)}
							className="text-sm text-primary-text font-semibold">
							{readMore ? "Show less" : "Read more"}
						</button>
					)}
				</div>
				{thumbnail && (
					<Link to="/">
						<div className="overflow-hidden rounded-lg m-2">
							{/* // 1st video img. */}
							<img
								src={thumbnail}
								alt="thumbnail"
								className="rounded-lg w-full aspect-auto"
							/>
						</div>
					</Link>
				)}
				<div className="flex justify-start gap-3 font-semibold tracking-wide">
					<button
						onClick={likeHanlder}
						className="flex items-center gap-1 text-xl hover:bg-background-lightest px-2 py-1 rounded-xl duration-300">
						{isliked ? <BiSolidLike /> : <BiLike />}
						<span className="text-xs">{likes}</span>
					</button>
					<button
						onClick={dislikeHanlder}
						className="flex items-center gap-1 text-xl hover:bg-background-lightest px-2 py-1 rounded-xl duration-300">
						{isDisliked ? <BiSolidDislike /> : <BiDislike />}
						<span className="text-xs">{dislikes}</span>
					</button>
					<Link to="/:userName/tweets/Id">
						<button className="flex items-center gap-1 text-xl hover:bg-background-lightest px-2 py-1 rounded-xl duration-300">
							<BiCommentDetail className="-scale-x-100" />
							<span className="text-xs">{comments}</span>
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ChannelTweetList;