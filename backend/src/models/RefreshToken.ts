import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRefreshToken extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    token: string;
    tokenFamily: string;
    expiresAt: Date;
    isRevoked: boolean;
    isUsed: boolean;
    replacedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    static: {
        generateTokenFamily(): string;
    };
}

export interface IRefreshTokenModel extends Model<IRefreshToken> {
    generateTokenFamily(): string;
}

const RefreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    tokenFamily: {
        type: String,
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false,
        index: true
    },
    isUsed: {
        type: Boolean,
        default: false,
        index: true
    },
    replacedBy: {
        type: Schema.Types.ObjectId,
        ref: 'RefreshToken',
        default: null
    }
}, {
    timestamps: true
});

RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ tokenFamily: 1, isRevoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

RefreshTokenSchema.statics.generateTokenFamily = function(): string {
    return uuidv4();
};

const RefreshToken = mongoose.models.RefreshToken || mongoose.model<IRefreshToken, IRefreshTokenModel>('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
