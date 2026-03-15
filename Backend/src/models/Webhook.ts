import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhook extends Document {
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
    schoolId?: mongoose.Schema.Types.ObjectId;
    createdBy: mongoose.Schema.Types.ObjectId;
    lastTriggeredAt?: Date;
    failureCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const WebhookSchema = new Schema({
    url: {
        type: String,
        required: true,
        validate: {
            validator: function(v: string) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'URL must be a valid HTTP(S) URL'
        }
    },
    events: [{
        type: String,
        enum: [
            'user.created',
            'user.updated',
            'user.deleted',
            'school.created',
            'school.updated',
            'class.created',
            'class.updated',
            'course.created',
            'course.completed',
            'grade.created',
            'grade.updated',
            'assessment.created',
            'assessment.completed',
            'student.enrolled',
            'student.unenrolled'
        ]
    }],
    secret: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'School'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastTriggeredAt: {
        type: Date
    },
    failureCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

WebhookSchema.index({ schoolId: 1, isActive: 1 });
WebhookSchema.index({ events: 1 });

const Webhook = mongoose.models.Webhook || mongoose.model<IWebhook>('Webhook', WebhookSchema);
export default Webhook;
