import express from 'express';
import { ensureAuthenticated } from '../middleware/auth';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/taskController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(ensureAuthenticated as express.RequestHandler);

// Task routes
router.get('/', getAllTasks as express.RequestHandler);
router.get('/:id', getTaskById as express.RequestHandler);
router.post('/', createTask as express.RequestHandler);
router.put('/:id', updateTask as express.RequestHandler);
router.delete('/:id', deleteTask as express.RequestHandler);

export default router;