const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body; 

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    const userF = users.some(user => user.username === username);
    if (userF) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
       
        const output = await new Promise((resolve, reject) => {
            resolve({ data: books });
        });

        const bookList = JSON.stringify(output.data, null, 4);
        return res.status(200).send(bookList);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    const isbn = req.params.isbn; 

    try {
       
        const response = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve({ data: books[isbn] });
            } else {
                reject(new Error(`Book with ISBN ${isbn} not found`));
            }
        });

        const bookDetails = JSON.stringify(response.data, null, 4);
        return res.status(200).send(bookDetails);

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    const authorName = req.params.author;

    try {
        
        const response = await new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            let authorBooks = {};

            bookKeys.forEach((isbn) => {
                if (books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
                    authorBooks[isbn] = books[isbn];
                }
            });

            if (Object.keys(authorBooks).length > 0) {
                resolve({ data: authorBooks });
            } else {
                reject(new Error(`No books found by author '${authorName}'`));
            }
        });

        const result = JSON.stringify(response.data, null, 4);
        return res.status(200).send(result);

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const titleName = req.params.title; 
    try {
        
        const response = await new Promise((resolve, reject) => {
            const bookKeys = Object.keys(books);
            let titleBooks = {};

            bookKeys.forEach((isbn) => {
                if (books[isbn].title.toLowerCase() === titleName.toLowerCase()) {
                    titleBooks[isbn] = books[isbn];
                }
            });

            if (Object.keys(titleBooks).length > 0) {
                resolve({ data: titleBooks });
            } else {
                reject(new Error(`No books found with title '${titleName}'`));
            }
        });

        const result = JSON.stringify(response.data, null, 4);
        return res.status(200).send(result);

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; 
    if (books[isbn]) {
        const reviews = books[isbn].reviews;
        const result = JSON.stringify(reviews, null, 4); 
        return res.status(200).send(result);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
