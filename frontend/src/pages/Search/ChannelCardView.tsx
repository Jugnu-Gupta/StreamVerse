import React from "react";
import { formatNumber } from "../../utils/FormatNumber";
import { ChannelType } from "../../Types/Channel.type";
import { useNavigate } from "react-router-dom";

interface ChannelCardViewProps {
    channelInfo: ChannelType;
}
const ChannelCardView: React.FC<ChannelCardViewProps> = ({ channelInfo }) => {
    const subscribers = formatNumber(channelInfo?.subsribers);
    const channelUserName = channelInfo.userName;
    const channelFullName = channelInfo.fullName;
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-2 p-2 group max-w-[400px]" onClick={() => navigate(`/channel/@${channelUserName}/videos`)}>
            <div className="rounded-xl overflow-hidden">
                <img src={channelInfo.avatar.url} alt="thumbnail" loading='lazy'
                    className="rounded-xl border-2 border-primary-border aspect-video group-hover:scale-110 duration-300"
                />
            </div>
            <div className="text-primary-text">
                <h2 className="text-md font-semibold truncate-lines-2">{channelFullName}</h2>
                <p className="truncate-lines-2 text-xs">{`@${channelUserName} • ${subscribers} subscribers`}</p>
            </div>
        </div>
    );
};

export default ChannelCardView;
