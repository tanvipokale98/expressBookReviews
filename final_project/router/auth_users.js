const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
     let userswithsamename = users.filter((user) => {
    return user.username === username;
});
// Return true if any user with the same username is found, otherwise false
if (userswithsamename.length > 0) {
    return true;
} else {
    return false;
}
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
   
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
   
    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
        
        
        req.session = req.session || {}; 
        req.session.accessToken = token;
        return res.status(200).json({ message: "User successfully logged in", token });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});


regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

 
    if (!req.session?.accessToken) {
        return res.status(401).json({ message: "Please log in to add a review" });
    }

    jwt.verify(req.session.accessToken, "fingerprint_customer", (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });

        const username = decoded.username;

        if (!books[isbn]) {
            return res.status(404).json({ message: `Book with ISBN ${isbn} does not exist` });
        }

        books[isbn].reviews ??= {};
        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: `Your review has been added/updated for ISBN ${isbn}`,
            reviews: books[isbn].reviews
        });
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    if (!req.session?.accessToken) {
        return res.status(401).json({ message: "Please log in to delete a review" });
    }

   
    jwt.verify(req.session.accessToken, "fingerprint_customer", (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired token" });

        const username = decoded.username;
        if (!books[isbn]) {
            return res.status(404).json({ message: `Book with ISBN ${isbn} does not exist` });
        }

        if (books[isbn].reviews?.[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({
                message: `Your review has been deleted for ISBN ${isbn}`,
                reviews: books[isbn].reviews
            });
        } else {
            return res.status(404).json({ message: "You have no review for this book" });
        }
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
