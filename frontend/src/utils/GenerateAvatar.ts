import { AVATAR_URL } from "../Constants";

export const generateAvatar = (
	fullName: string,
	background: string = "random",
	color: string = "000",
	size: number = 36
) => {
	return `${AVATAR_URL}&background=${background}&name=${fullName}&color=${color}&size=${size}`;
};