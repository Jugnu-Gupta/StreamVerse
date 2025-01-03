import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";

const Login: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="w-full flex justify-center items-center min-h-[100vh] bg-background-primary">
			<div className="flex min-w-[750px] h-[400px] shadow-[0_0_5px_white] rounded-lg">
				<div className="flex flex-col justify-center bg-background-secondary rounded-l-lg text-center p-4 w-2/3">
					<h1 className="text-primary-login text-3xl font-bold pb-4">
						Login To Your Account
					</h1>
					<LoginForm />
				</div>
				<div className="w-1/3 flex flex-col rounded-r-lg justify-center items-center bg-primary-login px-2">
					<h1 className="text-white font-bold text-3xl pb-2">
						Hello, Welcome!
					</h1>
					<p className="text-white text-sm pb-3">Don't have an account?</p>
					<button
						onClick={() => navigate("/register")}
						className="bg-white px-3 py-1 tracking-wide font-medium rounded-lg text-sm">
						Sign Up
					</button>
				</div>
			</div>
		</div>
	);
};

export default Login;
