import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'assignment', 'grade', 'invitation', 'school_request', 'school_approved', 'school_rejected', 'new_registration', 'deletion_approved', 'deletion_rejected'],
        default: 'info'
    },
    link: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
