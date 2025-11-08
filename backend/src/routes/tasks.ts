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
router.use(ensureAuthenticated);

// Task routes
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;