import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { UserType } from "../types/user.type";
import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import mongoose, { isValidObjectId } from "mongoose";
import fs from "fs";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

interface RequestWithUser extends Request {
    user: UserType;
}

interface UpdateUserPasswordBody {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

const UpdateUserPassword = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const {
            email,
            currentPassword,
            newPassword,
            confirmPassword,
        }: UpdateUserPasswordBody = req.body;

        if (!email) {
            throw new ApiError(400, "Email is required");
        }
        if (newPassword !== confirmPassword) {
            throw new ApiError(
                400,
                "New password and confirm password do not match"
            );
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const isPasswordValid: Boolean =
            await user.isPasswordCorrect(currentPassword);
        if (!isPasswordValid) {
            throw new ApiError(401, "Incorrect password");
        }

        if (currentPassword === newPassword) {
            throw new ApiError(
                400,
                "New password cannot be same as old password"
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { password: newPassword },
            { new: true }
        )?.select("avatar coverImage isVerified");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user: updatedUser },
                    "Password changed successful"
                )
            );
    }
);

const getCurrentUser = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        return res
            .status(200)
            .json(new ApiResponse(200, { user: req.user }, "User found"));
    }
);

interface UpdateUserDetailsBody {
    fullName?: string;
    userName?: string;
}
// controller to update user account details like fullName, userName
const updateUserDetails = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { fullName, userName }: UpdateUserDetailsBody = req.body;
        if (!fullName?.trim() || !userName?.trim()) {
            throw new ApiError(400, "FullName and username are required");
        }

        // check if the username already exists.
        const existedUser = await User.findOne({
            userName: userName.toLowerCase(),
        });
        if (existedUser) {
            throw new ApiError(409, "Username already exists");
        }

        // update the user profile.
        const user = await User.findByIdAndUpdate(
            req?.user?._id,
            { $set: { fullName, userName: userName.toLowerCase() } },
            { new: true }
        )?.select("userName fullName email avatar coverImage isVerified");

        if (!user) {
            throw new ApiError(
                500,
                "Something went wrong while updating the user profile"
            );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user },
                    "User profile updated successfully"
                )
            );
    }
);

const updateUserAvatar = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const avatarLocalPath: string | undefined = req.file?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        // delete the old cover image from cloudinary if exists.
        if (req.user?.avatar?.publicId) {
            const oldAvatar = await deleteFromCloudinary(
                req.user?.avatar?.publicId,
                "image"
            );

            // check if the old cover image is deleted successfully.
            if (!oldAvatar) {
                fs.unlinkSync(avatarLocalPath);
                throw new ApiError(
                    500,
                    "Failed to delete old avatar image from cloudinary"
                );
            }
        }

        // uploading images to cloudinay and updating the user profile.
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            throw new ApiError(500, "Image upload failed on cloudinary");
        }

        const user = await User.findByIdAndUpdate(
            req?.user?._id,
            {
                $set: {
                    avatar: {
                        publicId: avatar.public_id,
                        url: avatar.secure_url,
                    },
                },
            },
            { new: true }
        )?.select("userName fullName email avatar coverImage isVerified");

        return res
            .status(200)
            .json(
                new ApiResponse(200, { user }, "Avatar updated successfully")
            );
    }
);

const updateUserCoverImage = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const coverImageLocalPath: string | undefined = req.file?.path;

        if (!coverImageLocalPath) {
            throw new ApiError(400, "Cover Image is required");
        }

        // delete the old cover image from cloudinary if exists.
        if (req?.user?.coverImage?.publicId) {
            const oldCoverImage = await deleteFromCloudinary(
                req?.user?.coverImage?.publicId,
                "image"
            );

            // check if the old cover image is deleted successfully.
            if (!oldCoverImage) {
                fs.unlinkSync(coverImageLocalPath);
                throw new ApiError(
                    500,
                    "Failed to delete old cover image from cloudinary"
                );
            }
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage) {
            throw new ApiError(500, "Image upload failed on cloudinary");
        }

        const user = await User.findByIdAndUpdate(
            req?.user?._id,
            {
                $set: {
                    coverImage: {
                        publicId: coverImage.public_id,
                        url: coverImage.secure_url,
                    },
                },
            },
            { new: true }
        )?.select("userName fullName email avatar coverImage isVerified");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user },
                    "Cover image updated successfully"
                )
            );
    }
);

interface GetUserChannelPageParams {
    userName?: string;
}
const getUserChannelPage = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        const { userName }: GetUserChannelPageParams = req.params;
        if (!userName) {
            throw new ApiError(404, "Username is missing");
        }

        const channel = await User.aggregate([
            { $match: { userName: userName.toLowerCase() } },
            {
                $lookup: {
                    from: "Subscription",
                    localField: "_id",
                    foreignField: "channelId",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "Subscription",
                    localField: "_id",
                    foreignField: "subscriberId",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    subscriberCount: { $size: "$subscribers" },
                    subscribedToCount: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscriberCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1,
                },
            },
        ]);

        // console.log("channel", channel);
        if (!channel?.length) {
            throw new ApiError(404, "Channel does not exists");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    channel[0],
                    "User channel fetched successfully"
                )
            );
    }
);

const getWatchHistory = asyncHandler(
    async (req: RequestWithUser, res: Response) => {
        // check if the user id is valid.
        if (!isValidObjectId(req?.user?._id)) {
            throw new ApiError(400, "Invalid user id");
        }
        const userId = new mongoose.Types.ObjectId(req?.user?._id);

        const user = await User.aggregate([
            { $match: { _id: userId } },
            { $unwind: "$watchHistory" },
            { $addFields: { watchedAt: "$watchHistory.watchedAt" } },
            {
                $lookup: {
                    from: "Video",
                    localField: "watchHistory.videoId",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "User",
                                localField: "ownerId",
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
                            $addFields: {
                                owner: { $arrayElemAt: ["$owner", 0] },
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    watchHistory: { $arrayElemAt: ["$watchHistory", 0] },
                },
            },
            { $addFields: { "watchHistory.watchedAt": "$watchedAt" } },
            {
                $group: {
                    _id: "$_id",
                    watchHistory: { $push: "$watchHistory" },
                },
            },
            { $project: { watchHistory: 1 } },
        ]);

        if (!user?.length) {
            throw new ApiError(404, "Watch history not found");
        }

        // sort by watchedAt.
        user[0].watchHistory.sort(
            (a: any, b: any) =>
                new Date(b.watchedAt).getTime() -
                new Date(a.watchedAt).getTime()
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    user[0].watchHistory,
                    "Watch history fetched successfully"
                )
            );
    }
);

export {
    UpdateUserPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserCoverImage,
    updateUserAvatar,
    getUserChannelPage,
    getWatchHistory,
};
