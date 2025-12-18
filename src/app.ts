import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import errorMiddleware from './Middleware/error';
import swaggerUI from 'swagger-ui-express';
import { RegisterRoutes } from './routes/tsoaRoutes';
import * as swaggerJson from './config/swagger.json';
import path from 'node:path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

RegisterRoutes(app);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJson));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
