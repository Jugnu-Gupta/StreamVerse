import React from "react";
import { useFormik } from "formik";
import { MdEmail } from "react-icons/md";
import makeApiRequest from "../../utils/MakeApiRequest";
import { LoginValidationSchema } from "./LoginValidationSchema";
import toast from "react-hot-toast";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = React.useState(false);
	const [showVerifyEmail, setShowVerifyEmail] = React.useState(false);

	const { values, touched, errors, handleChange, handleSubmit, handleBlur } = useFormik({
		initialValues: {
			email: "",
			password: "",
		},
		validationSchema: LoginValidationSchema,
		onSubmit: async (values) => {
			makeApiRequest({
				method: "post",
				url: "/api/v1/auths/login",
				data: values,
			}).then((response: any) => { // eslint-disable-line
				const responseData = response.data;
				console.log("Login Info:", responseData);
				toast.success("Logged in successfully");
				setShowVerifyEmail(false);

				// data in localStorage for future use
				localStorage.setItem("userId", responseData.user._id);
				localStorage.setItem("token", responseData.accessToken);
				localStorage.setItem("userName", responseData.user.userName);
				localStorage.setItem("fullName", responseData.user.fullName);
				localStorage.setItem("email", responseData.user.email);
				// localStorage.setItem("avatar", responseData.user.avatar.url);
				// localStorage.setItem("cover", responseData.user.coverImage.url);

				navigate("/");
			}).catch((error) => {
				if (error.status === 403) {
					setShowVerifyEmail(true);
					console.error(error.response.data.message);
				} else {
					setShowVerifyEmail(false);
					toast.error(error.response.data.message);
				}
			});
		},
	});

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-3 items-center text-white">
			<div className="relative">
				<input
					type="email"
					name="email"
					id="email"
					value={values.email}
					placeholder="Email"
					onChange={handleChange}
					onBlur={handleBlur}
					className="pl-2 pr-10 py-1.5 w-72 rounded-md bg-background-primary 
                	outline-none transition delay-[50000s] placeholder:text-white text-sm"
				/>
				<label htmlFor="email">
					<MdEmail className="absolute top-2 right-2" />
				</label>
				{touched.email && errors.email ? <p className="text-start text-xs mt-0.5">{errors.email}</p> : null}
			</div>
			<div className="relative">
				<input
					type={showPassword ? "text" : "password"}
					name="password"
					id="password"
					value={values.password}
					placeholder="Password"
					onChange={handleChange}
					onBlur={handleBlur}
					className="pl-2 pr-10 py-1.5 w-72 rounded-md bg-background-primary
				outline-none transition delay-[50000s] placeholder:text-white text-sm"
				/>
				<label htmlFor="password" className="cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
					{
						showPassword ? <FaRegEyeSlash className="absolute top-2 right-2 text-sm" /> :
							<FaRegEye className="absolute top-2 right-2 text-sm" />
					}
				</label>
				{touched.password && errors.password ? <p className="text-start text-xs mt-0.5">{errors.password}</p> : null}
			</div>
			{
				showVerifyEmail &&
				<div className="bg-primary w-72 px-1 py-0.5 mb-1 rounded-md text-sm text-justify">
					An email has been sent to your email address. Please verify your email address.
				</div>
			}
			<button
				type="submit"
				className="px-4 py-2 mb-1 tracking-wide font-medium 
				text-xs text-white rounded-md bg-primary">
				Sign Up
			</button>
		</form>
	);
};

export default LoginForm;
