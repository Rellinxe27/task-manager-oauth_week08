import { Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../types';

// Get all tasks for the authenticated user
export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Only fetch tasks that belong to the authenticated user
        const tasks = await Task.find({ userId: req.user!._id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving tasks',
            error: error.message
        });
    }
};

// Get single task by ID (only if it belongs to the user)
export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
            return;
        }

        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user!._id
        });

        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found or access denied'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving task',
            error: error.message
        });
    }
};

// Create new task for the authenticated user
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, status, dueDate } = req.body;

        // Validation - check required fields
        if (!title || !description || !dueDate) {
            res.status(400).json({
                success: false,
                message: 'Please provide title, description, and dueDate'
            });
            return;
        }

        if (title.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Title cannot be empty'
            });
            return;
        }

        if (title.length > 100) {
            res.status(400).json({
                success: false,
                message: 'Title cannot exceed 100 characters'
            });
            return;
        }

        if (description.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Description cannot be empty'
            });
            return;
        }

        if (description.length > 500) {
            res.status(400).json({
                success: false,
                message: 'Description cannot exceed 500 characters'
            });
            return;
        }

        if (status && !['pending', 'in-progress', 'completed'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Status must be: pending, in-progress, or completed'
            });
            return;
        }

        // Validate date format
        const dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
            return;
        }

        // Create task with authenticated user's ID
        const task = await Task.create({
            title,
            description,
            status,
            dueDate,
            userId: req.user!._id
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
            return;
        }
        res.status(400).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
};

// Update task (only if it belongs to the user)
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
            return;
        }

        const { title, description, status, dueDate } = req.body;

        // Validation for updated fields
        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Title cannot be empty'
                });
                return;
            }
            if (title.length > 100) {
                res.status(400).json({
                    success: false,
                    message: 'Title cannot exceed 100 characters'
                });
                return;
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || description.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Description cannot be empty'
                });
                return;
            }
            if (description.length > 500) {
                res.status(400).json({
                    success: false,
                    message: 'Description cannot exceed 500 characters'
                });
                return;
            }
        }

        if (status !== undefined && !['pending', 'in-progress', 'completed'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Status must be: pending, in-progress, or completed'
            });
            return;
        }

        if (dueDate !== undefined) {
            const dueDateObj = new Date(dueDate);
            if (isNaN(dueDateObj.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
                return;
            }
        }

        // Update only if task belongs to authenticated user
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!._id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found or access denied'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
            return;
        }
        if (error.name === 'CastError') {
            res.status(400).json({
                success: false,
                message: 'Invalid data type'
            });
            return;
        }
        res.status(400).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
};

// Delete task (only if it belongs to the user)
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Validate MongoDB ObjectId format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            res.status(400).json({
                success: false,
                message: 'Invalid task ID format'
            });
            return;
        }

        // Delete only if task belongs to authenticated user
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user!._id
        });

        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found or access denied'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: task
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
};