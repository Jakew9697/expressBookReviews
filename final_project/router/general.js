//This contains the implementations for the routes which a general user can access.
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


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
public_users.get('/', async function (req, res) {
  try{
    const response = await axios.get('http://localhost:5000/');
    const books = response.data;
    res.send(JSON.stringify({books}, null, 5));
  } catch(error){
    console.error('Error retrieving books', error);
    res.status(500).send('Internal server error');
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = parseInt(req.params.isbn);
  try {
    const response = await axios.get('http://localhost:5000/isbn/' + isbn);
    const book = response.data;

    if (book) {
      res.status(200).json(book);

    }else {
    res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    console.error('Error retrieving books by isbn', error);
    res.status(500).send('Internal server error');
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function(req, res) {
  let authorName = req.params.author
  let matchingBooks = [];

  try {
    await Promise.all(Object.keys(books).map(async key => {
      const book = books[key];
      if(book.author === authorName){
        const response = await axios.get('http://localhost:5000/author/${authorName}');
        matchingBooks.push(response.data);
      }
  }
));

if (matchingBooks.length > 0) {
  res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "Author not found" });
  }
}   catch (error) {
  console.error('fetching book by author:', error);
  res.status(500).send('Internal server error');
}});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const titleName = req.params.title;
  const matchingTitleBooks = [];

  try {
    // Using async-await
    await Promise.all(Object.keys(books).map(async key => {
      const book = books[key];
      if (book.title === titleName) {
        const response = await axios.get(`http://localhost:5000/title/${titleName}`);
        matchingTitleBooks.push(response.data);
      }
    }));

    if (matchingTitleBooks.length > 0) {
      res.status(200).json(matchingTitleBooks);
    } else {
      res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    console.error('Error fetching books by title:', error);
    res.status(500).send('Internal Server Error');
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
