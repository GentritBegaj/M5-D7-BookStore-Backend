import { Router } from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import uniqid from "uniqid";

const router = Router();

const pathToBooks = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data/books.json"
);

router.get("/", async (req, res, next) => {
  try {
    const books = await fs.readJSON(pathToBooks);
    res.status(200).send(books);
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.get("/:bookId/comments", async (req, res, next) => {
  try {
    const books = await fs.readJSON(pathToBooks);
    const index = books.findIndex((book) => book.asin === req.params.bookId);
    if (index !== -1) {
      const newBookObj = books[index];
      if (newBookObj.hasOwnProperty("comments")) {
        const comments = newBookObj.comments;
        res.status(200).send(newBookObj);
      } else {
        res.send("This book has no comments yet");
      }
    } else {
      const error = new Error({ message: `No book with this asin is found` });
      error.httpStatusCode = 500;
      next(error);
    }
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.post("/:bookId/comments", async (req, res, next) => {
  // console.log(req.body);
  try {
    const books = await fs.readJSON(pathToBooks);
    const index = books.findIndex((book) => book.asin === req.params.bookId);
    // console.log({ index });
    if (index !== -1) {
      const newComment = {
        text: req.body.text,
        username: req.body.username,
        commentId: uniqid(),
        createdAt: new Date(),
      };
      // console.log(newComment);
      const book = books[index];
      if (book.comments) {
        book.comments = [...book.comments, newComment];
      } else {
        book.comments = [newComment];
      }
      books[index] = book;
      await fs.writeJSON(pathToBooks, books);
      res.status(201).send(book);
    } else {
      res.status(404).send({ message: `No book with this asin is found` });
    }
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

router.delete("/:bookId/comments/:commentId", async (req, res, next) => {
  try {
    const books = await fs.readJSON(pathToBooks);
    const index = books.findIndex((book) => book.asin === req.params.bookId);
    if (index !== -1) {
      const book = books[index];
      let comments = book.comments;

      comments = comments.filter(
        (comment) => comment.commentId !== req.params.commentId
      );

      book.comments = [...comments];
      books[index] = book;
      console.log(books[index], "SSSSSSSSS");
      await fs.writeJSON(pathToBooks, books);
      res.send(book);
    } else {
      res.status(404).send({ message: `No book with this asin found` });
    }
  } catch (err) {
    // const error = new Error(err.message);
    // error.httpStatusCode = 500;
    // next(Error);
    console.log(err);
  }
});

export default router;
