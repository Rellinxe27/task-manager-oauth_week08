import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types';

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<ITask>('Task', taskSchema);
