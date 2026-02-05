# 🎬 Movie Explorer (Vanilla JavaScript Project)

## 📌 Project Description

**Movie Explorer** is a simple single-page web application built using **only HTML, CSS, and vanilla JavaScript**.  
The app allows users to search for movies, view movie details, and create a temporary watchlist during a browsing session.

This project was created to help beginners practice **core JavaScript concepts** such as DOM manipulation, event handling, API fetching, and working with arrays — without using any frameworks.

> ⚠️ The watchlist is temporary and will reset when the page is refreshed. This is intentional.

---

## 🎯 Project Objective

The main goal of this project is to practice and demonstrate understanding of:

- JavaScript events
- Fetching data from an external API
- Updating the DOM dynamically
- Managing data using arrays
- Applying styles dynamically using JavaScript

---

## 🚀 Features

### 🔍 Movie Search

- Users can search for movies using a search input
- Movie data is fetched from the **OMDb API**
- Results are displayed as movie cards
- A loading message is shown while searching
- Error messages are displayed when:
  - No movies are found
  - The API key is invalid
  - There is a network problem

---

### 🎞 Movie Cards

Each movie card displays:
- Movie poster
- Movie title
- Release year
- Movie type

**Interactions:**
- Hovering over a card adds a scale and shadow effect
- Clicking a card shows more movie details
- Each card has an **Add to Watchlist** button

---

### 📌 Temporary Watchlist

- Users can add movies to a watchlist
- Watchlist is stored in a JavaScript array
- Movies can be removed from the watchlist
- The watchlist clears automatically when the page reloads

---

### 🌙 Dark / Light Mode

- A button allows users to toggle dark mode
- Uses `classList.toggle()` to switch themes
- Smooth transitions for background and text colors

---

## 🧠 Concepts Practiced

This project focuses on beginner JavaScript concepts such as:

- Selecting elements from the DOM
- Handling user events (click, hover, input)
- Fetching data using `fetch()`
- Handling errors and empty responses
- Using arrays to store and update data
- Dynamically updating HTML content
- Adding and removing CSS classes with JavaScript

---

## 🛠 Technologies Used

- HTML
- CSS
- Vanilla JavaScript
- OMDb API

No frameworks or libraries were used.

---

## 📁 Project Structure

movie-explorer/
│
├── index.html
├── styles.css
├── script.js
└── README.md


---

## 🔑 How to Get an OMDb API Key

1. Visit:  
   https://www.omdbapi.com/apikey.aspx

2. Fill in the form:
   - Name: your name
   - Email: a valid email address
   - Type of use: Personal / Non-commercial

3. Submit the form and check your email

4. Click the activation link sent to your email

5. Use your API key in the JavaScript file:

```js
fetch(`https://www.omdbapi.com/?apikey=YOUR_API_KEY&s=batman`)
```
---

## How to Run the Project

- Download or clone the project

- Open the project folder

- Open index.html in a web browser
(or open the folder in VS Code and use Live Server)
