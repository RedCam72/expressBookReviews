const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Missing fields
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Username already exists
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn; // retrieve ISBN from request params

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({ message: "Book not found" });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    // 1) obtain all keys for the books object
    const keys = Object.keys(books);

    // 2) iterate and match author
    const matchingBooks = [];

    keys.forEach((isbn) => {
        if (books[isbn].author === author) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    });

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    const keys = Object.keys(books);
    const matchingBooks = [];
  
    keys.forEach((isbn) => {
      if (books[isbn].title === title) {
        matchingBooks.push({ isbn, ...books[isbn] });
      }
    });
  
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }
  
    return res.status(404).json({ message: "No books found for this title" });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const reviews = books[isbn].reviews;
  
    // treat undefined/null or an empty object as "no reviews"
    if (!reviews || Object.keys(reviews).length === 0) {
      return res.status(404).json({ message: "No book review found" });
    }
  
    return res.status(200).json(reviews);
});

// Task 10 (Async/Await + Axios): Get the book list available in the shop
public_users.get('/async/books', async (req, res) => {
  try {
    // Call your existing "get all books" endpoint asynchronously
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book list", error: err.message });
  }
});

// Task 11 (Async/Await + Axios): Get book details based on ISBN
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;

    // Call your existing synchronous ISBN endpoint via Axios
    const url = `${req.protocol}://${req.get("host")}/isbn/${isbn}`;
    const response = await axios.get(url);

    return res.status(200).json(response.data);
  } catch (err) {
    // If the inner call returned 404, forward it cleanly
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "Error fetching book by ISBN", error: err.message });
  }
});

// Task 12 (Async/Await + Axios): Get book details based on author
public_users.get('/async/author/:author', async (req, res) => {
    try {
      const author = req.params.author;
  
      // Call the existing synchronous author endpoint via Axios
      const url = `${req.protocol}://${req.get("host")}/author/${encodeURIComponent(author)}`;
      const response = await axios.get(url);
  
      return res.status(200).json(response.data);
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(500).json({ message: "Error fetching books by author", error: err.message });
    }
  });
  
module.exports.general = public_users;
