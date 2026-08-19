import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const publicPath = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'src', 'public');

const viewsPath = fs.existsSync(path.join(__dirname, 'views'))
  ? path.join(__dirname, 'views')
  : path.join(__dirname, '..', 'src', 'views');

app.use(express.static(publicPath));
app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(routes);

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      success: false,
      message: `API endpoint '${req.method} ${req.path}' không tồn tại`,
    });
  } else {
    res.status(404).render('pages/404', {
      title: 'Không Tìm Thấy Trang (404) | VIMES',
      path: req.path,
    });
  }
});

app.use(errorHandler);

export default app;
