import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
	username: string
	email: string
	password: string
}

const UserSchema: Schema = new Schema({
	username: {
		type: String,
		unique: true
	},
	email: {
		type: String,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
})

export default mongoose.model<IUser>("User", UserSchema)
