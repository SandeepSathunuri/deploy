import {config}  from './src/config.js';
import app from './src/app.js';
import mongoose from 'mongoose';

const PORT = config.PORT;

mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
