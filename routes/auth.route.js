import express from "express";

const authRouter = express.Router();

authRouter.use(express.json());
authRouter.use(express.urlencoded({ extended: true }));

authRouter.get("/", (req, res) => {
  res.send("auth route working");
});

export default authRouter;