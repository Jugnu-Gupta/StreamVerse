import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const videoFetchAll = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    if (!userId) {
        throw new ApiError(400, "User id is required")
    }
})


const videoUpload = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const { title, description, isPublished } = req.body;
    if (!title || !description || !isPublished) {
        const message = !title ? "Title is required" :
            (!description ? "Description is required" : "isPublished is required");
        throw new ApiError(400, message);
    }

    const videoLocalPath = req?.files?.video?.[0]?.path;
    const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path;
    if (!videoLocalPath || !thumbnailLocalPath) {
        const message = !videoLocalPath ? "Video is required" : "Thumbnail is required";
        throw new ApiError(400, message);
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!video?.secure_url || !thumbnail?.secure_url) {
        const message = !video ? "Failed to upload video" : "Failed to upload thumbnail";
        throw new ApiError(500, message);
    }

    const video = await Video.create({
        videoFile: {
            publicId: videoFile?.public_id,
            url: videoFile?.secure_url || "",
        },
        thumbnail: {
            publicId: thumbnail?.public_id,
            url: thumbnail?.secure_url || "",
        },
        title,
        description,
        duration: video?.duration,
        ownerId: req.user?._id,
        isPublished: isPublished,
    });

    // check if video is created
    const uploadedVideo = await video.findById(video?._id);
    if (!uploadedVideo) {
        throw new ApiError(500, "Failed to upload video");
    }

    return res.status(201).json(
        new ApiResponse(201, uploadedVideo, "Video uploaded successfully")
    );
})


const videoFetchById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
})


const videoUpdate = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail

    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req?.file?.path;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }
    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "Title, description or thumbnail is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnailLocalPath) {
        // delete existing thumbnail
        if (video?.thumbnail?.publicId) {
            const oldThumbnail = await deleteFromCloudinary(video.thumbnail.publicId, "image");

            // check if thumbnail is deleted
            if (!oldThumbnail) {
                throw new ApiError(500, "Failed to delete thumbnail");
            }
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
            throw new ApiError(500, "Failed to upload thumbnail");
        }
        video.thumbnail = {
            publicId: thumbnail?.public_id,
            url: thumbnail?.secure_url,
        }
    }

    const updatedVideo = await video.save();
    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
})


const videoDelete = asyncHandler(async (req, res) => {
    //TODO: delete video

    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // delete video and thumbnail from cloudinary
    const deleteVideo = await deleteFromCloudinary(video.videoFile.publicId, "video");
    const deleteThumbnail = await deleteFromCloudinary(video.thumbnail.publicId, "image");
    if (!deleteVideo) {
        throw new ApiError(500, "Failed to delete video from cloudinary");
    }
    if (!deleteThumbnail) {
        throw new ApiError(500, "Failed to delete thumbnail from cloudinary");
    }

    const videoDetails = await video.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "Like",
                localField: "_id",
                foreignField: "videoId",
                as: "videoLikes",
            }
        },
        {
            $lookup: {
                from: "Comment",
                localField: "_id",
                foreignField: "videoId",
                as: "videoComments",
                pipeline: [
                    {
                        $lookup: {
                            from: "Like",
                            localField: "_id",
                            foreignField: "commentId",
                            as: "commentLikes"
                        }
                    }
                ]
            }
        },
        {
            $project: {
                videoLikes: 1,
                videoComments: 1
            }
        }
    ]);
    if (!videoDetails) {
        throw new ApiError(500, "No likes or comments found");
    }

    // Extract videoLikeId, commentId and LikeId of comments from videoDetails
    const videoLikeIds = videoDetails[0]?.videoLikes.map(like => like._id);
    const commentIds = videoDetails[0]?.videoComments.map(comment => comment._id);
    const commentLikeIds = videoDetails[0]?.videoComments.map((comment) => {
        return comment.commentLikes.map(like => like._id);
    });

    // delete video, video likes, comments and comments likes
    const delVideo = await video.findByIdAndDelete(videoId);
    if (!delVideo) {
        throw new ApiError(500, "Failed to delete video");
    }

    const delVideoLikes = await Like.deleteMany({ _id: { $in: videoLikeIds } });
    if (!delVideoLikes?.acknowledged) {
        throw new ApiError(500, "Failed to delete video likes");
    }

    const delComments = await Comment.deleteMany({ _id: { $in: commentIds } });
    if (!delComments?.acknowledged) {
        throw new ApiError(500, "Failed to delete comments of video");
    }

    const delCommentsLikes = await Like.deleteMany({ _id: { $in: commentLikeIds } });
    if (!delCommentsLikes?.acknowledged) {
        throw new ApiError(500, "Failed to delete comments likes of video");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
})


const VideoTogglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, video, "Publish status updated successfully")
    );
})

export {
    videoFetchAll, videoUpload, videoFetchById,
    videoUpdate, videoDelete, VideoTogglePublishStatus
};