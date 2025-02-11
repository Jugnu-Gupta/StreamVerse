import React from 'react';
import VideoListView from '../Search/VideoListView';
import VideoCardView from '../Home/VideoCardView';
import makeApiRequest from '../../utils/MakeApiRequest';
import { useNavigate } from 'react-router-dom';
import { VideoType } from '../../type/Video.type';
import NoResultsFound from '../Search/NoResultsFound';
import loadingGIF from '../../assets/loading.gif';
import { ErrorType } from '../../type/Error.type';
import { ResponseType } from '../../type/Response.type';
import toast from 'react-hot-toast';

interface VideoWrapper {
    _id: string;
    video: VideoType;
}
const LikedVideos: React.FC = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = React.useState<VideoWrapper[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        setLoading(true);
        makeApiRequest({
            method: "get",
            url: "/api/v1/likes/video",
        }).then((response) => {
            const data = (response as ResponseType).data.likedVideos;
            setVideos(data);
        }).catch((error: ErrorType) => {
            console.error(error.response.data.message);
            if (error.response.data.statusCode == 401) {
                toast.error("Please login to view your liked videos.");
            }
            navigate("/");
        }).finally(() => {
            setLoading(false);
        });
    }, [navigate]);


    return (videos?.length === 0 ?
        (!loading ? <NoResultsFound style='mt-40' entityName='video'
            heading='No videos found' message="You haven't liked any video." />
            : (<div className='w-full h-full flex justify-center items-center'>
                <img src={loadingGIF} alt="loading" loading='lazy' className='w-24' />
            </div>))
        : <div className="sm:flex m-2 max-w-full w-11/12 justify-items-center">
            <div className='sm:flex hidden flex-col'>
                {videos?.map((item: VideoWrapper) => (
                    <VideoListView key={item._id} videoInfo={item.video} />
                ))}
            </div>
            <div className='sm:hidden flex flex-col'>
                {videos?.map((item: VideoWrapper) => (
                    <VideoCardView key={item._id} videoInfo={item.video} />
                ))}
            </div>
        </div>
    )
}

export default LikedVideos;