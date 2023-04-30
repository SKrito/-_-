const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');

const app = express();

// Підключення до бази даних MongoDB
mongoose.connect('mongodb://localhost/url-shortener', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Створення схеми та моделі для зберігання відповідності між оригінальним та скороченим посиланням
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, default: shortid.generate }
});

const Url = mongoose.model('Url', urlSchema);

// Обробка запитів GET та POST для створення скороченого посилання та повернення оригінального посилання
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  try {
    let url = await Url.findOne({ originalUrl });

    if (url) {
      res.json(url);
    } else {
      const shortUrl = shortid.generate();
      const newUrl = new Url({ originalUrl, shortUrl });
      await newUrl.save();
      res.json(newUrl);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server Error');
  }
});

app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });

    if (url) {
      res.redirect(url.originalUrl);
    } else {
      res.status(404).json('No URL Found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('Server Error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
