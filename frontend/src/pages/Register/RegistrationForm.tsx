import React from "react";
import { useFormik } from "formik";
import { FaUserAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import makeApiRequest from "../../utils/MakeApiRequest";
import type { ApiRequestOptions } from "../../utils/MakeApiRequest";
import { RegistrationValidationSchema } from "./RegistrationValidationSchema";
import toast from "react-hot-toast";

const RegistrationForm: React.FC = () => {
	const [showVerifyEmail, setShowVerifyEmail] = React.useState(false);
	const { values, errors, touched, handleChange, handleSubmit, handleBlur } =
		useFormik({
			initialValues: {
				name: "",
				email: "",
				password: "",
			},
			validationSchema: RegistrationValidationSchema,
			onSubmit: async (values) => {
				try {
					const request: ApiRequestOptions = {
						method: "post",
						url: "/api/v1/auths/register",
						data: {
							fullName: values.name,
							email: values.email,
							password: values.password,
						},
					};
					const res: any = await makeApiRequest(request);
					console.log(values);
					console.log(res);

					setShowVerifyEmail(true);
				} catch (error: any) {
					console.error("Error registering");
					setShowVerifyEmail(false);
					toast.error(error.response.data.message);
				}
			},
		});

	return (
		<form onSubmit={handleSubmit}
			className="flex flex-col gap-3 items-center text-white">
			<div className="relative">
				<input
					type="text"
					name="name"
					id="name"
					value={values.name}
					placeholder="Name"
					onChange={handleChange}
					onBlur={handleBlur}
					className="pl-2 pr-10 py-1.5 w-72 rounded-md bg-background-primary transition delay-[50000s]
					placeholder:text-white text-sm outline-none"
				/>
				<label htmlFor="name">
					<FaUserAlt className="absolute right-2 top-2 text-sm" />
				</label>
				{touched.name && errors.name ? <p className="text-start text-xs mt-0.5">{errors.name}</p> : null}
			</div>
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
					<MdEmail className="absolute right-2 top-2" />
				</label>
				{touched.email && errors.email ? <p className="text-start text-xs mt-0.5">{errors.email}</p> : null}
			</div>
			<div className="relative">
				<input
					type="password"
					name="password"
					id="password"
					value={values.password}
					placeholder="Password"
					onChange={handleChange}
					onBlur={handleBlur}
					className="pl-2 pr-10 py-1.5 w-72 rounded-md bg-background-primary 
					outline-none transition delay-[50000s] placeholder:text-white text-sm"
				/>
				<label htmlFor="password">
					<FaLock className="absolute right-2 top-2 text-sm" />
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
				className="px-4 py-2 mb-1 tracking-wide font-medium outline-none
					text-xs text-white rounded-md bg-primary">
				Sign Up
			</button>
		</form>
	);
};

export default RegistrationForm;
