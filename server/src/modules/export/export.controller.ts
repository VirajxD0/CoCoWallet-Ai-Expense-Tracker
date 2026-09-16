import { Request, Response } from 'express';
import { exportService } from './export.service';
import { sendSuccess } from '../../common/utils/apiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validate';
import { exportQuerySchema, importSchema } from './export.schema';
import { Readable } from 'stream';

export class ExportController {
  export = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await exportService.exportData(req.user!.userId, req.query as any);
    sendSuccess(res, result, 200);
  });

  download = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const jobId = req.params.jobId as string;
    const job = await exportService.getJob(jobId, req.user!.userId);

    if (!job) {
      res.status(404).json({ status: 'error', code: 'NOT_FOUND', message: 'Export job not found' });
      return;
    }

    if (job.status !== 'completed' || !job.file_path) {
      res.status(400).json({ status: 'error', code: 'NOT_READY', message: 'Export not ready' });
      return;
    }

    const fs = require('fs');
    const path = require('path');
    const filePath = path.join('/Users/virajdeshmukh/newProj/server/uploads/exports', job.file_path);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ status: 'error', code: 'FILE_NOT_FOUND', message: 'Export file not found' });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${job.file_path}"`);
    res.setHeader('Content-Type', job.format === 'json' ? 'application/json' : 'text/csv');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  import = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ status: 'error', code: 'NO_FILE', message: 'No file uploaded' });
      return;
    }

    const result = await exportService.importData(req.user!.userId, req.file.path, req.body);
    
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    sendSuccess(res, result, 200);
  });

  history = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const history = await exportService.getHistory(req.user!.userId);
    sendSuccess(res, history, 200);
  });
}

export const exportController = new ExportController();