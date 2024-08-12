import express from 'express';
import cors from 'cors';

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, wssdsd!' });
});

app.get('/api/ayaya', (req, res) => {
    res.json({message: {x:28, y: 122}});
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
