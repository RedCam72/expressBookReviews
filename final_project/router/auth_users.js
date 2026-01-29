const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password) => { //returns boolean
    // check if username and password match what we have in records
    return users.some((user) => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    // sign JWT and store it in session
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  
    req.session.authorization = {
      accessToken,
      username
    };
  
    return res.status(200).json({ message: "Customer successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
  
    // username saved in session during login
    const username = req.session.authorization && req.session.authorization.username;
  
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }
  
    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required" });
    }
  
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
  
    // Ensure reviews object exists
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update this user's review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

// Delete a book review (only the logged-in user's review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    const username = req.session.authorization && req.session.authorization.username;
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
      return res.status(404).json({ message: "No book review found" });
    }
  
    // User has no review on this ISBN
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user" });
    }
  
    // Delete only this user's review
    delete books[isbn].reviews[username];
  
    // (Optional) If reviews is now empty, keep it as {} for consistency
    if (Object.keys(books[isbn].reviews).length === 0) {
      books[isbn].reviews = {};
    }
  
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: books[isbn].reviews
    });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
