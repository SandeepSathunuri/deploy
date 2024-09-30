import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    likeID: {
        type: String,
        required: true,
        unique: true
    },
    userID: {
        type: String,
        required: true
    },
    slideID: {
        type: String,
        required: true
    }
});

export default mongoose.model('Like', likeSchema);
