const express = require('express');
const router = express.Router();
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const filePath = './data/user-data.json';

const fetchPostData = () => {

  try {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading posts data:', error);
    return { posts: [] }; 
  }
};

router.use(cors());
const savePostData = (posts, filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify({ posts }));
  } catch (error) {
    console.error('Error saving posts data:', error);
  }
};

// Endpoint to get a specific post by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const postMatch = fetchPostData().posts.find((post) => post.postId == id);

  if (!postMatch) {
    return res
      .status(404)
      .json({ error: 'Post not found. Please check and try again' });
  }

  return res.status(200).json(postMatch);
});

router.get('/', (req, res) => {
  const allPosts = fetchPostData().posts;

  return res.status(200).json(allPosts);
});
router.post('/add', (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required fields.' });
  }

  const newPost = {
    postId: uuidv4(),
    title,
    content,
    category,
    likes: 0,
    comments: [],
  };

  const allPosts = [...fetchPostData().posts, newPost];
  savePostData(allPosts, filePath);

  res.status(201).json({ message: 'Post added successfully!', newPost });
  console.log("added post")
});

router.post('/:postId/comments/add', (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required for adding a comment.' });
  }

  const allPosts = fetchPostData().posts;
  const post = allPosts.find(post => post.postId == postId);

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const newComment = {
    commentId: uuidv4(),
    userId: "1234",
    comment: content,
  };

  post.comments.push(newComment);
  savePostData(allPosts, filePath);

  res.status(201).json({ message: 'Comment added successfully!', newComment });
  console.log("added comment")
});

router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const allPosts = fetchPostData().posts;

  const postIndex = allPosts.findIndex((post) => post.postId === id);

  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  allPosts[postIndex].likes += 1;

  savePostData(allPosts, filePath);

  res.status(200).json({ message: 'Post liked successfully!', newLikes: allPosts[postIndex].likes });
  console.log("like added")
});

module.exports = router;
