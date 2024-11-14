import { Validator } from "node-input-validator";
import jwt from "jsonwebtoken";
import { Transporter, createTransport } from "nodemailer";

const host = process.env.MAIL_HOST ?? "";
const user = process.env.MAIL_USER ?? "";
const pass = process.env.MAIL_PASS ?? "";

export const InputValidator = async (input: object, rules: object): Promise<void> => {
	return new Promise((resolve, reject) => {
		const v = new Validator(input, rules);

		v.check()
			.then((match: boolean) => {
				if (!match) {
					const error = (Object.values(v.errors)[0] as any).message;
					reject(error);
				} else {
					resolve();
				}
			})
			.catch((error) => {
				reject(error);
			});

	});
};

export const fileSupportedFormat = ["image", "video", "application"];
export const storySupportedFormat = ["image", "video"];

export const MailSender = async (email: string, title: string, body: string): Promise<boolean> => {
	try {
		const configOptions = {
			host: host,
			port: 465,
			secure: true,
			auth: {
				user: user,
				pass: pass
			}
		};
		const transporter: Transporter = createTransport(configOptions);
		await transporter.sendMail({
			from: "RhythmChat ORG.",
			to: `${email}`,
			subject: `${title}`,
			html: `${body}`
		});
		return true;
	} catch (error) {
		console.log("Error in Mail Send: ", error);
		return false;
	}
};

export default function generateToken(payload: { _id: string }, expiresIn: string = "1d") {
	return jwt.sign(payload, process.env.JWT_SECRET ?? "", { expiresIn });
}