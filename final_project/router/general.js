//This contains the implementations for the routes which a general user can access.
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


//Register a new user
public_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  if(!username ||!password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  const existingUser = users.find(user => user.username === username);
  if(existingUser) {
    return res.status(400).json({message: "Username already exists"});
  }
  const newUser = {username, password};
  users.push(newUser);
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify({books}, null, 5));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  let book = Object.values(books).find(b => b.isbn === isbn);

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function(req, res) {
  let authorName = req.params.author
  let matchingBooks = [];
  Object.keys(books).forEach(key => {
    let book = books[key];
    if (book.author === authorName) {
      matchingBooks.push(book);
    }
  });
  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Author not found" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function(req, res) {
  let titleName = req.params.title;
  let matchingTitleBooks = [];
  Object.keys(books).forEach(key => {
    let book = books[key];
    if (book.title === titleName) {
      matchingTitleBooks.push(book);
    }
  });
  if (matchingTitleBooks.length > 0) {
    return res.status(200).json(matchingTitleBooks);
  } else {
    return res.status(404).json({ message: "Title not found" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn);
  if(books[isbn]) {
  const reviews = books[isbn].reviews;
  const reviewsArray = Object.values(reviews);
  if (reviewsArray.length > 0) {
    return res.status(200).json(reviewsArray);
  } else {
    return res.status(404).json({ message: "Review not found" });
  } } else {
    return res.status(404).json({ message: "Book with specified isbn not found" });
  }
});

module.exports.general = public_users;
