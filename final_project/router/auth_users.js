const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{ //returns boolean
//write code to check if the username is valid
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = req.session.user;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {accessToken,username}
    req.session.user = {username}
  return res.status(200).send("User successfully logged in" +" " + username);
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

//GET logged in user information
regd_users.get("/profile", (req, res) => {
  const user = req.session.user;
  if (user) {
      console.log("User:", user); // Log user information from session
      return res.status(200).json(user.username);
  } else {
      return res.status(401).json({ message: "User not logged in" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.session.user;
  const rating = req.body.rating;
  const isbn = req.params.isbn;

  if (!user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Find the book with the specified ISBN
  let foundBooks = [];

    for (let key in books) {
        if (books[key].isbn === isbn) {
            foundBooks.push(books[key]);
        }
    }
  if (!foundBooks.length==1) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Generate a unique ID for the new review
  const reviewId = Object.keys(foundBooks[0].reviews).length + 1;

  // Add the review to the book's reviews
  foundBooks[0].reviews[reviewId] = { rating, user: user.username };

  return res.status(200).json({ "message": "Review added successfully", "Book": foundBooks[0] });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.session.user;
  const isbn = req.params.isbn;

  if (!user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Find the book with the specified ISBN
  let foundBooks = [];

    for (let key in books) {
        if (books[key].isbn === isbn) {
            foundBooks.push(books[key]);
        }
    }
  if (!foundBooks.length==1) {
      return res.status(404).json({ message: "Book not found" });
  }
  const book = foundBooks[0];

  // Filter the reviews of the book based on the session username
  const userReviews = Object.keys(book.reviews).filter(reviewId => {
    return book.reviews[reviewId].user === user.username;
  });

  // Check if the user has any reviews for the book
  if (userReviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for the user" });
  }

  // Delete the user's reviews for the book
  userReviews.forEach(reviewId => {
      delete book.reviews[reviewId];
  });

  return res.status(200).json({ "message": "Reviews deleted successfully", "Book": book });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
