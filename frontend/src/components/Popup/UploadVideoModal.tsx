import { twMerge } from 'tailwind-merge';
import { RxCross2 } from "react-icons/rx";
import { MdOutlineFileUpload } from "react-icons/md";
import React, { Dispatch, SetStateAction } from 'react';
import validateMediaSize from '../../utils/ValidateMediaSize';
import { useMedia } from '../../hooks/useMedia';
import { makeApiMediaRequest } from '../../utils/MakeApiRequest';
import toast from 'react-hot-toast';

interface UploadVideoModalProps {
    setVideoName: Dispatch<SetStateAction<string>>;
    setVideoSize: Dispatch<SetStateAction<number>>;
    setUploadProgress: Dispatch<SetStateAction<number>>;
    setShowUploadVideo: Dispatch<SetStateAction<boolean>>;
    setShowUploadingVideo: Dispatch<SetStateAction<boolean>>;
}

const UploadVideoModal: React.FC<UploadVideoModalProps> = ({ setUploadProgress, setVideoName, setVideoSize, setShowUploadVideo, setShowUploadingVideo }) => {
    const [thumbnail, setThumbnail] = React.useState<File | null>(null);
    const divRef = React.useRef<HTMLDivElement>(null);
    const thumbnailRef = React.useRef<HTMLInputElement>(null);
    const { fileInputRef: videoRef, mediaPreview: videoPreview, setMediaPreview: setVideoPreview,
        newMedia: newVideo, setNewMedia: setNewVideo, handleMediaChange: handleVideoChange,
        discardMediaChange: discardVideoChanges } = useMedia();
    const [videoTitle, setVideoTitle] = React.useState<string>("");
    const [videoDescription, setVideoDescription] = React.useState<string>("");
    const updateThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0] && validateMediaSize(e.target.files, 1)) {
            setThumbnail(e.target.files![0]);
        }
    }

    const updateMedia = (files: FileList) => {
        setVideoName(files[0].name);
        setVideoSize(files[0].size);
    }

    const discardChanges = () => {
        discardVideoChanges();
        setThumbnail(null);
        setShowUploadVideo(false);

        if (thumbnailRef.current)
            thumbnailRef.current.value = "";
    }

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        divRef.current!.classList.add('opacity-50');
    }
    const onDragLeave = () => divRef.current!.classList.remove('opacity-50');
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        divRef.current!.classList.remove('opacity-50');
        if (e.dataTransfer.files[0].type !== 'video/mp4') {
            console.log('Invalid file type');
        } else {
            if (e.dataTransfer.files && validateMediaSize(e.dataTransfer.files, 15)) {
                setVideoPreview(URL.createObjectURL(e.dataTransfer.files[0]));
                setNewVideo(e.dataTransfer.files[0]);
                updateMedia(e.dataTransfer.files);
            }
        }
    }

    const uploadVideo = () => {
        if (!thumbnail || !newVideo || videoTitle === "" || videoDescription === "") return;

        const data = new FormData();
        data.append("image", thumbnail);
        data.append("video", newVideo);
        data.append("title", videoTitle);
        data.append("description", videoDescription);

        setShowUploadVideo(false);
        setShowUploadingVideo(true);
        makeApiMediaRequest({
            method: "post",
            url: "/api/v1/videos",
            data,
            onUploadProgress: (progressEvent) => {
                const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / (progressEvent.total)) : 0;
                setUploadProgress(progress);
            }
        }).then(() => {
            toast.success("Video uploaded successfully");
            // window.location.reload();
        }).catch((error) => {
            console.error("Error uploading video:", error);
        })
    }

    return (
        <div className='w-full -ml-6 h-full flex justify-center items-center absolute z-[1]'>
            <div className='rounded-lg border-[1px] border-primary-border bg-background-secondary p-4 max-w-96 text-wrap w-fit h-fit overflow-y-auto'>
                <div className='flex gap-2 justify-between items-start'>
                    <div className='text-primary-text'>
                        <h1 className='text-xl font-semibold text-start'>Upload Video</h1>
                        <p className='text-xs text-start text-primary-text2'>Share where you've worked on your profile.</p>
                    </div>
                    <button onClick={() => setShowUploadVideo(false)}>
                        <RxCross2 size={24} className='text-primary-text' />
                    </button>
                </div>

                <div className='mt-4 text-primary-text'>
                    <div>
                        <label htmlFor={videoPreview ? "" : "video"} className='text-sm mb-1'>
                            <div className={twMerge('border-dashed border-2 rounded-lg border-primary-border p-1 aspect-video flex items-center justify-center',
                                !videoPreview && "cursor-pointer")}>
                                {videoPreview ? (<video src={videoPreview} controls className='rounded-lg' />) :
                                    (<div ref={divRef}
                                        onDragOver={(e) => onDragOver(e)}
                                        onDragLeave={() => onDragLeave()}
                                        onDrop={(e) => onDrop(e)}
                                        className='w-full flex flex-col items-center justify-center px-2 rounded-lg aspect-video object-cover'>
                                        <MdOutlineFileUpload className='text-5xl p-1 bg-primary-text text-primary rounded-full' />
                                        <h2 className='text-xs font-semibold mt-2 mb-1'>Drag and drop video files to upload</h2>
                                        <p className='text-xs'>Your videos will be private untill you publish them</p>
                                    </div >)
                                }
                            </div>
                        </label>
                        <input type="file" name="video" id="video" accept="video/mp4" className='hidden' ref={videoRef}
                            onChange={(e) => handleVideoChange(e, 15, updateMedia)}
                        />
                    </div>

                    <div className='mt-2'>
                        <label htmlFor="thumbnail" className='text-sm mb-1'>
                            <p>Thumbnail<sup>*</sup></p>
                        </label>
                        <input type="file" name="thumbnail" id="thumbnail" accept="image/png,image/jpeg"
                            onChange={updateThumbnail} ref={thumbnailRef}
                            className='text-sm file:bg-primary file:border-primary-border file:outline-none file:cursor-pointer
                            file:border-[2px] file:px-1.5 file:py-1 file:rounded-md file:text-primary-text py-0.5' />
                    </div>

                    <div className='mt-2 text-sm'>
                        <label htmlFor="title" className='text-sm mb-1'>Title<sup>*</sup></label> <br />
                        <input type="text" name="title" id="title" placeholder='Video title' value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)}
                            className='bg-transparent border-2 border-primary-border rounded-md w-full px-1.5 py-0.5 outline-none' />
                    </div>

                    <div className='mt-2 text-sm'>
                        <label htmlFor="description" className='text-sm mb-1'>Description<sup>*</sup></label> <br />
                        <textarea name="description" id="description" placeholder='Video description' value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)}
                            className='bg-transparent border-2 border-primary-border rounded-md w-full overflow-auto px-1.5 py-0.5 resize-none outline-none' rows={6}></textarea>
                    </div>
                </div>

                <div className='flex justify-center gap-4 mt-4 text-sm'>
                    <button onClick={discardChanges}
                        className='border-2 border-primary-border bg-transparent text-white px-4 py-2 w-full rounded-lg'>
                        Cancel</button>
                    <button onClick={uploadVideo}
                        className={twMerge('text-primary bg-primary-text px-4 py-2 w-full font-semibold rounded-lg',
                            (!thumbnail || !newVideo || videoTitle === "" || videoDescription === "") && 'opacity-50')}>
                        Upload</button>
                </div>
            </div>
        </div>
    )
}

export default UploadVideoModal;