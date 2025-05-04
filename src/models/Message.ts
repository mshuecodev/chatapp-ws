import mongoose, { Schema, Document } from "mongoose"

export interface IMessage extends Document {
	sender: string // User ID of the sender
	receiver: string // User ID of the receiver (or group ID for group chats)
	content: string // Text content of the message
	timestamp: Date // When the message was sent
	status: "sent" | "delivered" | "read" // Message status
	isGroupMessage: boolean // Whether the message is part of a group chat
	groupId?: string // Group ID (if applicable)
	attachments?: { type: string; url: string }[] // Attachments (e.g., images, files)
	deletedFor?: string[] // List of user IDs for whom the message is deleted
}

const MessageSchema: Schema = new Schema({
	sender: {
		type: String,
		required: true
	},
	receiver: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		enum: ["sent", "delivered", "read"],
		default: "sent"
	},
	isGroupMessage: {
		type: Boolean,
		default: false
	},
	groupId: {
		type: String,
		required: function () {
			return this.isGroupMessage
		}
	},
	attachments: [
		{
			type: {
				type: String, // e.g., "image", "video", "file"
				required: true
			},
			url: {
				type: String,
				required: true
			}
		}
	],
	deletedFor: {
		type: [String], // Array of user IDs
		default: []
	}
})

export default mongoose.model<IMessage>("Message", MessageSchema)
