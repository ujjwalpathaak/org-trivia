import express from "express";

import authRouter from "./auth.route.js";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.send("API Working");
});

router.use("/auth", authRouter);

export default router;