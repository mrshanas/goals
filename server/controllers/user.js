import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import Post from "../models/postModel.js";

export const loginUser = async (req, res) => {
  const user = await User.find({ email: req.body.email });
  if (user) {
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (match) {
      const token = jwt.sign({ id: user[0]._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      res.status(200).json({
        token,
      });
    }
  } else {
    res.status(404).json({
      message: "User not found, Please login",
    });
  }
};

export const registerUser = async (req, res) => {
  const { password } = req.body;
  try {
    let userDetails;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (!err) {
        userDetails = { ...req.body, password: hashedPassword };
        User.create(userDetails, (err, user) => {
          // assign jwt after user registers
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
          });
          if (!err) {
            return res.status(201).json({
              success: true,
              token,
            });
          } else {
            return res.status(409).json({
              message:
                "User with that email or username already exists, Please try another username",
            });
          }
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export const displayUserAndPosts = (req, res) => {
  User.find({ username: req.params.username })
    .then((response) => {
      Post.find({ author: response[0].id }).then((posts) =>
        res.status(200).json({
          user: response[0],
          posts,
        })
      );
    })
    .catch((err) => console.error(err));
};
