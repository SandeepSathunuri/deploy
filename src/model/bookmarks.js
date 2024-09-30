import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    bookmarkID: {
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

export default mongoose.model('Bookmark', bookmarkSchema);
