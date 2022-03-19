import Post from "../models/postModel.js";
import Comment from "../models/comment.js";
import User from "../models/userModel.js";

export const displayPosts = (req, res) => {
  Post.find(
    {},
    "author caption _id likes createdAt updatedAt photo",
    (err, posts) => {
      !err
        ? res.status(200).json({ posts })
        : res.status(404).json({
            message: "Not found",
          });
    }
  );
};

export const createPost = (req, res) => {
  const post = req.body;
  post.author = req.user.id;

  Post.create(post, (err, post) => {
    !err
      ? res.status(201).json({ message: "Successfully created", post })
      : res.status(500).json({
          message: "Internal server error",
        });
  });
};

export const displayPostCommentsAndLikes = (req, res) => {
  Post.find({ _id: req.params.postID }, (err, post) => {
    if (!err) {
      Comment.find(post.comments).then((comments) =>
        res.status(200).json({ post: post[0], comments })
      );
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  });
};

export const deletePost = (req, res) => {
  // this controller delete a post and its related comments
  Post.deleteOne({ _id: req.params.postID })
    .then((deletedPost) => {
      Comment.deleteMany(deletedPost.comments).then(() => res.status(204));
    })
    .catch((err) =>
      res.status(404).json({ message: "post with that id doesnt exist", err })
    );
};

// liking and disliking posts
export const likeOrDislikePost = (req, res) => {
  Post.findById(req.params.postId)
    .then((post) => {
      if (!post.likes.includes(req.user.id)) {
        post.likes.push(req.user.id);
        post.save();
      } else {
        const index = post.likes.indexOf(req.user.id);
        post.likes.splice(index, 1);
        post.save();
      }
      return res.status(200);
    })
    .catch((err) =>
      res.status(404).json({ message: "Post not found", error: err })
    );
};

// comments logic
export const commentPost = (req, res) => {
  const comment = req.body;
  comment.post = req.params.postId;
  comment.author = req.user.id;

  Comment.create(comment)
    .then((comment) => {
      Post.findByIdAndUpdate(req.params.postId)
        .then((post) => {
          post.comments.push(req.params.postID);
          post.save();
          return res
            .status(201)
            .json({ message: "Comment successfully created", post, comment });
        })
        .catch((err) => res.status(500));
    })
    .catch((err) =>
      res.status(500).json({ message: "Internal server error", error: err })
    );
};

export const deleteComment = (req, res) => {
  Comment.findByIdAndDelete(req.params.commentID, (err, comm) => {
    if (err) {
      res.status(404).json({
        message: "Comment not found",
      });
    } else {
      res.status(204);
    }
  });
};
