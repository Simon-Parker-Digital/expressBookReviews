const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();





public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
      return res.status(200).json(books);
  } catch (error) {
      console.error('Error fetching books:', error);
      return res.status(500).json({ message: 'Error fetching books' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) { 
  try{
    const isbn = req.params.isbn;
      let foundBooks = [];

      for (let key in books) {
          if (books[key].isbn === isbn) {
              foundBooks.push(books[key]);
          }
      }

      if (foundBooks.length > 0) {
          return res.status(200).json(foundBooks);
      } else {
          return res.status(404).json({ message: "Book not found with ISBN: " + isbn });
      }
  }
  catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Error fetching books' });
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    try {
      const author = req.params.author;
    let foundBooks = [];

    for (let key in books) {
        if (books[key].author === author) {
            foundBooks.push(books[key]);
        }
    }

    if (foundBooks.length > 0) {
        return res.status(200).json(foundBooks);
    } else {
        return res.status(404).json({ message: "Book not found with Author: " + author});
    }
  } catch (error) {
      console.error('Error fetching books:', error);
      return res.status(500).json({ message: 'Error fetching books' });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    try {
      const title = req.params.title;
    let foundBooks = [];

    for (let key in books) {
        if (books[key].title === title) {
            foundBooks.push(books[key]);
        }
    }

    if (foundBooks.length > 0) {
        return res.status(200).json(foundBooks);
    } else {
        return res.status(404).json({ message: "Book not found with Author: " + title});
    }
  } catch (error) {
      console.error('Error fetching books:', error);
      return res.status(500).json({ message: 'Error fetching books' });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    let foundBookReviews = [];

    for (let key in books) {
        if (books[key].isbn === isbn) {
            foundBookReviews.push(books[key].reviews);
        }
    }

    if (foundBookReviews.length > 0) {
        return res.status(200).json(foundBookReviews);
    } else {
        return res.status(404).json({ message: "Book reviews not found with ISBN: " + isbn });
    }
});

module.exports.general = public_users;
