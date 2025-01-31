import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
    slideID: {
        type: String,
        required: true,
        unique: true
    },
    storyID: {
        type: String,
        required: true
    },
    heading: {
        type: String,
    },
    description: {
        type: String,
    },
    imageOrVideoURl: {
        type: String,
    },
    category: {
        type: String,
    },
    likeCount: { type: Number, default: 0 },
});

export default mongoose.model('Slide', slideSchema);
