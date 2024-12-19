import express from "express";

const healthcheck = async (req, res) => {
  try {
    res.status(200);
    res.send("Everything is good to go");
  } catch (error) {
    res.status(400);
    res.send(error);
  }
};

export default healthcheck;
