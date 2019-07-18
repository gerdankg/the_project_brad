const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
// @route       POST API / Posts
// @description Test route
// @access      Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

// @route       get api / posts
// @description get allposts
// @access    Prvate

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route       get api / posts/:id ((of post))
// @description get post by id
// @access    Prvate

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (!err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('server error');
  }
});

// @route       delete api / posts/:id
// @description delete a post
// @access    Prvate

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    // delete post who create post
    //check on user //doing tostring because it's int
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    if (!err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('server error');
  }
});

// @route       PUT api / posts/LIKE/:id
// @description LIKE a post
// @access    Prvate
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //since its' incl in url

    //check if the post has already been liked by a user (not infinity likes by one user)
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      //if it's trye
      return res.status(400).json({ msg: 'Post already liked' });
    }

    // if post doesnt liked

    post.likes.unshift({ user: req.user.id });

    await post.save(); //save it to database

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route       PUT api / posts/unlike/:id
// @description unlike a post
// @access    Prvate

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //since its' incl in url

    //check if the post has already been liked by a user and we unlike(not infinity likes by one user)
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      //if it's trye
      return res
        .status(400)
        .json({ msg: 'Post already has not yet  been liked' });
    }

    // Get remove index

    //create variable
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id); //for each like i return

    post.likes.splice(removeIndex, 1);
    await post.save(); //save it to database

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

// @route       POST api/posts/comment/:id
// @description Comment on a post
// @access      Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        //object (without new its object)
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

// @route       delete api/posts/comment/:id/:comment_id --because we neeed find a comment
// @description delete comment
// @access      Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //get a comment by id

    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    //Make sure comment exist

    if (!comment) {
      return res.status(404).json({ msg: 'comment doesnt exist' });
    }

    //Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'user not authorized' });
    }

    // Get remove index

    //create variable
    const removeIndex = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id); //for each comment i return

    post.comments.splice(removeIndex, 1);

    await post.save(); //save it to database

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});

module.exports = router;
