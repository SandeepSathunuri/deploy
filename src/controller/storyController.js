import StoryModel from '../model/stories.js';
import SlideModel from '../model/slideModel.js';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import bookmarkModel from '../model/bookmarks.js';
import Likemodel from '../model/likeModel.js';

const createStoryWithSlide = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userID, slides } = req.body;

        // Validate input
        if (!userID || !slides || !Array.isArray(slides) || slides.length < 3 || slides.length > 6) {
            throw new Error("Invalid input: Must provide userID and 3 to 6 slides.");
        }

        const storyCategory = slides[0].category;
        const newStory = new StoryModel({
            storyID: randomUUID(),
            userID,
            createdOn: Date.now(),
            category: storyCategory
        });

        await newStory.save({ session });

        const newSlides = slides.map(slide => new SlideModel({
            slideID: randomUUID(),
            storyID: newStory.storyID,
            heading: slide.heading,
            description: slide.description,
            imageOrVideoURl: slide.imageOrVideoURl,
            category: slide.category,
            likeCount: 0
        }));

        await SlideModel.insertMany(newSlides, { session });
        await session.commitTransaction();

        const createdStory = {
            ...newStory.toObject(),
            slides: newSlides.map(slide => slide.toObject())
        };

        res.status(201).json({ message: 'Story and slides created successfully!', data: createdStory });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
};

const getStoryByCategory = async (req, res) => {
    try {
        const { category, limit = 4 } = req.query; 
        const limitInt = parseInt(limit);

        const matching = category && category !== 'All' ? { category } : {}; // Filter by category if not 'All'

        const storyAggregation = [
            { $match: matching }, 
            {
                $group: { // Group stories by category
                    _id: "$category",
                    stories: { $push: "$$ROOT" }, 
                    totalCount: { $sum: 1 } 
                }
            },
            {
                $project: { 
                    stories: { $slice: ["$stories", limitInt] },
                    category: "$_id",
                    totalCount: 1 
                }
            }
        ];

        const allstories = await StoryModel.aggregate(storyAggregation);

        const allCategories = ['Music', 'Movies', 'World', 'India'];

        const categoryMap = {};
        allstories.forEach(categoryGroup => {
            categoryMap[categoryGroup._id] = {
                stories: categoryGroup.stories,
                hasMore: categoryGroup.totalCount > limitInt
            };
        });

        // Fetch slides for each story
        const storylist = await Promise.all(allCategories.map(async (category) => {
            const data = categoryMap[category] || { stories: [], hasMore: false };
            
            // For each story, fetch the associated slides
            const storiesWithSlides = await Promise.all(data.stories.map(async (story) => {
                const slides = await SlideModel.find({ storyID: story.storyID });
                return { ...story, slides: slides.map(slide => slide.toObject()) }; // Include slides in the story object
            }));

            return {
                category,
                hasMore: data.hasMore,
                stories: storiesWithSlides
            };
        }));

        // Only return the complete storylist when 'All' is selected
        if (category === 'All') {
            res.status(200).json({ data: storylist });
        } else {
            // For specific categories, return only the matched category
            res.status(200).json({ data: [storylist.find(cat => cat.category === category)] });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStorybyId = async (req, res) => {
    try {
        const { storyID } = req.query;
        const storydata = await StoryModel.findOne({ storyID });
        const slideData = await SlideModel.find({ storyID });
        res.status(200).json({ slides: slideData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const setbookmark = async (req, res) => {
    try {
        const { userID, slideID } = req.body;

        if (!userID || !slideID) {
            throw new Error("Missing required fields ");
        }

        const newBookmarkModel = new bookmarkModel({
            bookmarkID: randomUUID(),
            slideID,
            userID
        });
        await newBookmarkModel.save();
        res.status(200).json({ message: "Bookmark added successfully", data: newBookmarkModel });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resetBookmarkById = async (req, res) => {
    try {
        const { slideID, userID } = req.body; 

        const result = await Likemodel.findOneAndDelete({ userID, slideID });

        if (result) {
            return res.status(200).json({ message: 'Bookmark removed successfully' });
        } else {
            return res.status(404).json({ error: 'Bookmark not found' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

const getbookmarkbyId = async (req, res) => {
    try {
        const { userID } = req.query;
        const bookmarkList = await bookmarkModel.find({ userID });

        const bookmarkDetailList = await Promise.all(
            bookmarkList.map(async (bookmark) => {
                return await SlideModel.findOne({ slideID: bookmark.slideID });
            })
        );

        res.status(200).json({ message: "Bookmark data fetched successfully", data: bookmarkDetailList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const isbookmarked = async (req, res) => {
    try {
        const { slideID, userID } = req.query; 

        const bookmark = await bookmarkModel.findOne({ userID, slideID });
        res.status(200).json({ isBookmarked: !!bookmark });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

const isLikedslides = async (req, res) => {
    try {
        const { slideID, userID } = req.query; 

        const like = await Likemodel.findOne({ userID, slideID });
        res.status(200).json({ isLiked: !!like });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

const likeslides = async (req, res) => {
    try {
        const { slideID, userID } = req.body;

        const existingLike = await Likemodel.findOne({ userID, slideID });
        if (existingLike) {
            return res.status(400).json({ message: 'You have already liked this story.' });
        }

        const newLike = new Likemodel({ 
            likeID: randomUUID(),
            userID,
            slideID
        });
        await newLike.save();

        // Update the slide's like count
        const slide = await SlideModel.findOne({ slideID });
        slide.likeCount += 1;
        await slide.save();

        res.status(200).json({ message: 'Story liked successfully', data: slide });
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

const unlikeSlides = async (req, res) => {
    try {
        const { slideID, userID } = req.body; 

        const result = await Likemodel.findOneAndDelete({ userID, slideID });

        const slide = await SlideModel.findOne({ slideID });
        slide.likeCount -= 1;
        await slide.save();

        if (result) {
            return res.status(200).json({ message: 'Unlike successful', data: slide });
        } else {
            return res.status(404).json({ error: 'Like not found' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

export {
    createStoryWithSlide,
    getStoryByCategory,
    getStorybyId,
    setbookmark,
    getbookmarkbyId,
    isbookmarked,
    isLikedslides,
    unlikeSlides,
    likeslides
};
