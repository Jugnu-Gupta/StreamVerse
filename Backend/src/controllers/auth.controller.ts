import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { UserType } from "../types/user.type";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import mongoose, { isValidObjectId } from "mongoose";
import { suggestAvailableUserName } from "../utils/suggestAvailableUserName";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { sendMail } from "../utils/sendMail";
import jwt from "jsonwebtoken";

interface RequestWithUser extends Request {
    user: UserType;
}
interface UserTypeDoc extends mongoose.Document, UserType {}

interface Option {
    httpOnly: boolean;
    secure: boolean;
}
interface accessTokenAndRefreshToken {
    accessToken: string;
    refreshToken: string;
}

const generateAccessAndRefreshToken = async (
    userId: string
): Promise<accessTokenAndRefreshToken> => {
    try {
        const user: UserTypeDoc = await User.findById(userId);
        const accessToken: string = user.generateAccessToken();
        const refreshToken: string = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

interface UploadedFile {
    path: string;
}
interface CustomFiles {
    avatar?: UploadedFile[];
    coverImage?: UploadedFile[];
}
interface FileType {
    files?: CustomFiles;
}

interface RegisterUserBody {
    fullName?: string;
    email?: string;
    userName?: string;
    password?: string;
}

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, userName, password }: RegisterUserBody = req.body;

    // check is all fields are given.
    if ([userName, fullName, email, password].some((field) => !field?.trim())) {
        throw new ApiError(400, `All fields are required`);
    }

    // check if the user exists: email, username.
    let existedUser: UserTypeDoc | null = await User.findOne({ userName });
    if (existedUser) {
        throw new ApiError(409, "User with username already exists");
    }
    existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const avatarLocalPath: string = (req as FileType).files?.avatar?.[0]?.path;
    const coverImageLocalPath: string = (req as FileType).files?.coverImage?.[0]
        ?.path;

    // uploading images to cloudinay
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // console.log("avatar", avatar);

    // timestamps values will be generated automatically.
    const user: UserTypeDoc = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: {
            publicId: avatar.public_id || "",
            url: avatar.secure_url || "",
        },
        coverImage: {
            publicId: coverImage?.public_id || "",
            url: coverImage?.secure_url || "",
        },
    });

    // check for user creation
    const createdUser: UserTypeDoc | null = await User.findById(
        user._id
    )?.select("userName fullName email avatar coverImage isVerified");
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // email verification
    const mail = await sendMail(
        "jugnubhai47@gmail.com",
        "VERIFY",
        createdUser._id
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                null,
                "A verification link has been sent to your email. Please verify to log in."
            )
        );
});

interface LoginUserQuery {
    email?: string;
    password?: string;
}

const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: LoginUserQuery = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user: UserTypeDoc | null = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid: boolean = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    // check if the user is verified.
    if (!user?.isVerified) {
        const mail = await sendMail(
            "jugnubhai47@gmail.com",
            "VERIFY",
            user._id
        );

        throw new ApiError(
            401,
            "A verification link has been sent to your email. Please verify to log in."
        );
    }

    const { accessToken, refreshToken }: accessTokenAndRefreshToken =
        await generateAccessAndRefreshToken(user._id);

    const loggedInUser: UserTypeDoc | null = await User.findById(
        user._id
    )?.select("userName fullName email avatar coverImage isVerified");
    if (!loggedInUser) {
        throw new ApiError(
            500,
            "Something went wrong while logging in the user"
        );
    }

    const options: Option = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successful"
            )
        );
});

interface Token {
    token?: string;
}
interface ConfirmUserEmailVerificationQuery extends Token {}
const validateUserEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token }: ConfirmUserEmailVerificationQuery = req.query;
    if (!token) {
        throw new ApiError(400, "Invalid token");
    }

    const user: UserTypeDoc | null = await User.findOne({
        verifyToken: token,
        verifyTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new ApiError(401, "Invalid token or token expired");
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Email verified successfully"));
});

const validatePasswordResetToken = asyncHandler(
    async (req: Request, res: Response) => {
        const { token }: Token = req.query;
        if (!token) {
            throw new ApiError(400, "Invalid token");
        }

        const user: UserTypeDoc | null = await User.findOne({
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        });
        if (!user) {
            throw new ApiError(401, "Invalid token or token expired");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, token, "Token verified successfully"));
    }
);

interface ResetPasswordQuery extends Token {
    newPassword?: string;
    confirmPassword?: string;
}

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword, confirmPassword }: ResetPasswordQuery =
        req.body;
    if (!token) {
        throw new ApiError(400, "Invalid token");
    }

    // check if the new password and confirm password are same.
    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "New password and confirm password do not match"
        );
    }

    const user = await User.findOneAndUpdate(
        {
            resetPasswordToken: token,
            resetPasswordTokenExpiry: { $gt: Date.now() },
        },
        {
            $set: { password: newPassword },
            $unset: {
                resetPasswordToken: "",
                resetPasswordTokenExpiry: "",
            },
        },
        { new: true }
    );
    if (!user) {
        throw new ApiError(401, "Invalid token or token expired");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset successful"));
});

const logoutUser = asyncHandler(async (req: RequestWithUser, res: Response) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: "" },
    });

    const options: Option = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

interface TokenPayload {
    _id: string;
}
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    try {
        const incomingRefreshToken: string | any =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        // verify the refresh token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        ) as TokenPayload;

        // find the user and check if the user exists
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(decodedToken._id);

        let loggedInUser = user.toObject();

        // Delete the password and refreshToken properties
        delete loggedInUser.password;
        delete loggedInUser.refreshToken;

        const options: Option = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    validateUserEmail,
    validatePasswordResetToken,
    resetPassword,
};