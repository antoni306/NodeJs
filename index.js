import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const API_URL = "https://secrets-api.appbrewery.com";


const yourBearerToken = "type in your bearer token";
const config = {
  headers: { Authorization: `Bearer ${yourBearerToken}` },
};

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs", { content: "Waiting for data..." });
});

app.post("/get-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    const result = await axios.get(API_URL + "/secrets/" + searchId, config);
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: JSON.stringify(error.response.data) });
  }
});

app.post("/post-secret", async (req, res) => {
  try {
    const result = await axios.post(API_URL + '/secrets', { secret: req.body.secret, score: req.body.score }, { headers: { 'Authorization': 'Bearer ' + yourBearerToken } });
    res.render('index.ejs', { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render('index.ejs', { content: error.message });
  }
});

app.post("/put-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    const result = await axios.put(API_URL + '/secrets/' + searchId, { secret: req.body.secret, score: req.body.score }, { headers: { 'Authorization': 'Bearer ' + yourBearerToken } });
    res.render("index.ejs", { content: JSON.stringify(result.data) });
  } catch (error) {
    res.render("index.ejs", { content: error.mesage });
  }
});

app.post("/patch-secret", async (req, res) => {
  const searchId = req.body.id;
  const newSecret = req.body.secret;
  const newScore = req.body.score;
  try {
    const result = await axios.patch(API_URL + '/secrets/' + searchId, { secret: newSecret, score: newScore }, { headers: { 'Authorization': 'Bearer ' + yourBearerToken } });
    res.render('index.ejs', { content: result.data });
  } catch (error) {
    res.render('index.ejs', { content: error.message });

  }
});

app.post("/delete-secret", async (req, res) => {
  const searchId = req.body.id;
  try {
    var result = await axios.delete(API_URL + '/secrets/' + searchId, { headers: { 'Authorization': 'Bearer ' + yourBearerToken } });
    res.render('index.ejs', { content: result.data });
  } catch (error) {
    res.render('index.ejs', { content: error.message });

  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
