//This contains the implementations for the routes which an authorized user can access.
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  return username.length >= 4;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
const user = users.find(user => user.username === username && user.password === password);
return !!user;
};

const findBookIndexByISBN = (isbn)=>{
  return Object.keys(books).findIndex(key => books[key].isbn === isbn);
};

const findReviewIndexByUsernameAndISBN = (username, isbn)=>{
  return books[isbn].reviews.findIndex(review => review.username === username)
};

// only registered users can login
regd_users.post("/login", (req,res) => {
  const{ username, password } = req.body;
    if(!username || !password){
    return res.status(400).json({message: "Invalid username or password"});
}
else{
  const token = jwt.sign({username}, 'your-secret-key', {expiresIn: 60 * 60});
  return res.status(200).json({message: "Logged in successfully", token});
}
});

regd_users.post("/customer/login", (req,res) => {
const {username,password} = req.body;

if (!isValid(username)) {
  return res.status(400).json({message: "Invalid username"});
}
if (authenticatedUser(username,password)) {
  const token = jwt.sign({username}, 'your-secret-key', {expiresIn: 60 * 60});
  req.session.username = username;

  return res.status(200).json({message: "Logged in successfully", token});
} else {
  return res.status(401).json({message: "Invalid username or password"});
}});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const{review} = req.query;
  const username = req.session.username; //retrieve username from session

  if(!username){
    return res.status(401).json({message: "User not logged in"});
  }
  if (!isbn || !review) {
    return res.status(400).json({message: "ISBN and review are required in query"});
  }

  const bookIndex = findBookIndexByISBN(isbn);

  if (bookIndex === undefined) {
    return res.status(404).json({message: "Book not found"});
  }

  const reviewIndex = findReviewIndexByUsernameAndISBN(username, isbn);

  if(reviewIndex === -1){
        // If the user has already reviewed the book, modify the existing review
        books[isbn].reviews[reviewIndex].review = review;
        books[isbn].reviews[reviewIndex].timestamp = Date.now();
        return res.status(200).json({ message: "Review modified successfully" });
  } else {
        // If the user hasn't reviewed the book, add a new review
        books[isbn].reviews.push({ username, review, timestamp: Date.now() });
        return res.status(201).json({ message: "Review added successfully" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticatedUser, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;
  const userReviews = reviews.filter(review => review.isbn === isbn && review.username === username);

  if (userReviews.length === 0) {
    return res.status(404).json({ message: "Review not found or unauthorized" });
  }

  // Remove the reviews for the given ISBN and username
  reviews = reviews.filter(review => !(review.isbn === isbn && review.username === username));

  res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
