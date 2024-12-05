import { Response, Request } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model";
import { UserType } from "types/user.type";
import { Like } from "../models/like.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

interface RequestWithUser extends Request {
    user: UserType;
}

interface GetVideoCommentsParams {
    videoId?: string;
    parentId?: string | null;
}
interface GetVideoCommentsQuery {
    page?: number;
    limit?: number;
}

const getVideoComments = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { videoId, parentId = null }: GetVideoCommentsParams = req.params;
        const { page = 1, limit = 10 }: GetVideoCommentsQuery = req.query;
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Video id is required");
        }

        const skip = (page - 1) * limit;
        const comments = await Comment.aggregate([
            {
                $match: {
                    videoId: new mongoose.Types.ObjectId(videoId),
                    parentId,
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "userId",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                userName: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "Comment",
                    localField: "_id",
                    foreignField: "parentId",
                    as: "replies",
                },
            },
            {
                $lookup: {
                    from: "Like",
                    let: { commentId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$entityId", "$$commentId"],
                                        },
                                        {
                                            $eq: ["$entityType", "Comment"],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "Likes",
                },
            },
            {
                $addFields: {
                    owner: { $arrayElemAt: ["$owner", 0] },
                    replies: { $size: "$replies" },
                    likes: {
                        $size: {
                            $filter: {
                                input: "$Likes",
                                as: "like",
                                cond: { $eq: ["$$like.isLiked", true] },
                            },
                        },
                    },
                    dislikes: {
                        $size: {
                            $filter: {
                                input: "$Likes",
                                as: "like",
                                cond: { $eq: ["$$like.isLiked", false] },
                            },
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    owner: 1,
                    content: 1,
                    likes: 1,
                    dislikes: 1,
                    replies: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);
        if (!comments?.length) {
            throw new ApiError(404, "No comments found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { comments }, "Comments found"));
    }
);

interface GetTweetCommentsParams {
    tweetId?: string;
    parentId?: string | null;
}
interface GetTweetCommentsQuery {
    page?: number;
    limit?: number;
}

const getTweetComments = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { tweetId, parentId = null }: GetTweetCommentsParams = req.params;
        const { page = 1, limit = 10 }: GetTweetCommentsQuery = req.query;
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Tweet id is required");
        }

        const skip = (page - 1) * limit;
        const comments = await Comment.aggregate([
            {
                $match: {
                    tweetId: new mongoose.Types.ObjectId(tweetId),
                    parentId,
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "userId",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                userName: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "Comment",
                    localField: "_id",
                    foreignField: "parentId",
                    as: "replies",
                },
            },
            {
                $lookup: {
                    from: "Like",
                    let: { commentId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$entityId", "$$commentId"],
                                        },
                                        {
                                            $eq: ["$entityType", "Comment"],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "Likes",
                },
            },
            {
                $addFields: {
                    owner: { $arrayElemAt: ["$owner", 0] },
                    replies: { $size: "$replies" },
                    likes: {
                        $size: {
                            $filter: {
                                input: "$Likes",
                                as: "like",
                                cond: { $eq: ["$$like.isLiked", true] },
                            },
                        },
                    },
                    dislikes: {
                        $size: {
                            $filter: {
                                input: "$Likes",
                                as: "like",
                                cond: { $eq: ["$$like.isLiked", false] },
                            },
                        },
                    },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    owner: 1,
                    content: 1,
                    likes: 1,
                    dislikes: 1,
                    replies: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            { $skip: skip },
            { $limit: limit },
        ]);
        if (!comments?.length) {
            throw new ApiError(404, "No comments found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { comments }, "Comments found"));
    }
);

interface CreateCommentInVideoParams {
    videoId?: string;
}
interface CreateCommentInVideoBody {
    content?: string;
    parentId?: string;
}

const createCommentInVideo = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { videoId }: CreateCommentInVideoParams = req.params;
        const { content, parentId }: CreateCommentInVideoBody = req.body;

        if (!content || !videoId) {
            const message = !content
                ? "Content is required"
                : "Video id is required";
            throw new ApiError(400, message);
        }

        const comment = await Comment.create({
            videoId,
            content,
            parentId: parentId ? parentId : null,
        });

        if (!comment) {
            throw new ApiError(500, "Failed to add comment");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, comment, "Comment added successfully"));
    }
);

interface CreateCommentInTweetParams {
    tweetId?: string;
}
interface CreateCommentInTweetBody {
    content?: string;
    parentId?: string;
}

const createCommentInTweet = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { tweetId }: CreateCommentInTweetParams = req.params;
        const { content, parentId }: CreateCommentInTweetBody = req.body;

        if (!content || !tweetId) {
            const message = !content
                ? "Content is required"
                : "tweet id is required";
            throw new ApiError(400, message);
        }

        const comment = await Comment.create({
            tweetId,
            content,
            parentId: parentId ? parentId : null,
        });

        if (!comment) {
            throw new ApiError(500, "Failed to add comment");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, comment, "Comment added successfully"));
    }
);

interface UpdateCommentParams {
    commentId?: string;
}
interface UpdateCommentBody {
    content?: string;
}
const updateComment = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { commentId }: UpdateCommentParams = req.params;
        const { content }: UpdateCommentBody = req.body;
        if (!commentId || !content) {
            const message = !commentId
                ? "Comment id is required"
                : "Content is required";
            throw new ApiError(400, message);
        }

        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { $set: { content } },
            { new: true }
        );
        if (!comment) {
            throw new ApiError(500, "Failed to update comment");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, comment, "Comment updated successfully")
            );
    }
);

// Recursive function to find all replies of a comment
const findRepliesRec = async (commentId: string) => {
    try {
        const replies = await Comment.find({ parentId: commentId });
        let result: any[] = [];
        for (let i = 0; i < replies.length; i++) {
            const reply = replies[i];
            const subReplies = await findRepliesRec(reply._id);

            result.push(reply._id);
            result.concat(subReplies);
        }
        return result;
    } catch (error) {
        throw new ApiError(500, "Failed to find replies");
    }
};

interface DeleteCommentParams {
    commentId?: string;
}

const deleteComment = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { commentId }: DeleteCommentParams = req.params;
        if (!commentId) {
            throw new ApiError(400, "Comment id is required");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Extract all replies/comments to be deleted.
        const commentIds = (await findRepliesRec(commentId)).push(commentId);

        // delete comment, allReplies, and its likes
        const delComment = await Comment.deleteMany({
            _id: { $in: commentIds },
        });
        const delLikes = await Like.deleteMany({
            commentId: { $in: commentIds },
        });
        if (!delComment?.acknowledged) {
            throw new ApiError(500, "Failed to delete comment");
        }
        if (!delLikes?.acknowledged) {
            throw new ApiError(500, "Failed to delete comment likes");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Comment deleted successfully"));
    }
);

export {
    getVideoComments,
    getTweetComments,
    createCommentInVideo,
    createCommentInTweet,
    updateComment,
    deleteComment,
};
