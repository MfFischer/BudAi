const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebase");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });
    res.status(201).json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;