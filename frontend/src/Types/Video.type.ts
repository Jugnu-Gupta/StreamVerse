export interface VideoType {
	_id: string;
	title: string;
	description: string;
	views: number;
	duration: number;
	thumbnail: {
		url: string;
		publicId: string;
	};
	owner?: {
		_id: string;
		userName: string;
		fullName: string;
		avatar?: {
			url: string;
			publicId: string;
		};
	};
	updatedAt: Date;
	createdAt: Date;
}

export interface VideoDetailsType extends VideoType {
	likeStatus: number;
	isPublished: boolean;
	quality: string;
	subscribers: number;
	likes: number;
	dislikes: number;
	noOfComments: number;
	VideoFile: {
		url: string;
		publicId: string;
	};
}
