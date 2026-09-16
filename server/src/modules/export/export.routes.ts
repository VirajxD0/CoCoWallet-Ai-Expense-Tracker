import { Router } from 'express';
import { exportController } from './export.controller';
import { authenticate } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import multer from 'multer';
import { exportQuerySchema, importSchema } from './export.schema';

const router = Router();
router.use(authenticate);

const upload = multer({ 
  dest: '/Users/virajdeshmukh/newProj/server/uploads/temp',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.mimetype === 'text/csv' || 
        file.originalname.endsWith('.json') || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files allowed'));
    }
  }
});

router.get('/', validate(exportQuerySchema, 'query'), exportController.export);
router.get('/history', exportController.history);
router.get('/download/:jobId', exportController.download);
router.post('/import', upload.single('file'), validate(importSchema, 'body'), exportController.import);

export default router;