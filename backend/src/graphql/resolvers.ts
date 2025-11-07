import Task from '../models/Task';
import { GraphQLContext } from '../types';
import { GraphQLError } from 'graphql';

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      return context.user;
    },

    tasks: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      try {
        const tasks = await Task.find({ userId: context.user._id }).sort({ createdAt: -1 });
        return {
          success: true,
          count: tasks.length,
          data: tasks
        };
      } catch (error: any) {
        throw new GraphQLError('Error retrieving tasks', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    task: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new GraphQLError('Invalid task ID format', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      try {
        const task = await Task.findOne({ _id: id, userId: context.user._id });
        
        if (!task) {
          throw new GraphQLError('Task not found or access denied', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return {
          success: true,
          data: task
        };
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Error retrieving task', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },

  Mutation: {
    createTask: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const { title, description, status, dueDate } = input;

      if (!title || !description || !dueDate) {
        throw new GraphQLError('Title, description, and dueDate are required', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (title.trim().length === 0) {
        throw new GraphQLError('Title cannot be empty', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (title.length > 100) {
        throw new GraphQLError('Title cannot exceed 100 characters', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (description.trim().length === 0) {
        throw new GraphQLError('Description cannot be empty', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      if (description.length > 500) {
        throw new GraphQLError('Description cannot exceed 500 characters', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        throw new GraphQLError('Invalid date format', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      try {
        const task = await Task.create({
          title,
          description,
          status: status?.replace('_', '-') || 'pending',
          dueDate,
          userId: context.user._id
        });

        return {
          success: true,
          message: 'Task created successfully',
          data: task
        };
      } catch (error: any) {
        throw new GraphQLError('Error creating task', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    updateTask: async (_: any, { id, input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new GraphQLError('Invalid task ID format', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      const { title, description, status, dueDate } = input;

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          throw new GraphQLError('Title cannot be empty', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (title.length > 100) {
          throw new GraphQLError('Title cannot exceed 100 characters', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
      }

      if (description !== undefined) {
        if (typeof description !== 'string' || description.trim().length === 0) {
          throw new GraphQLError('Description cannot be empty', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        if (description.length > 500) {
          throw new GraphQLError('Description cannot exceed 500 characters', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
      }

      if (dueDate !== undefined) {
        const dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
          throw new GraphQLError('Invalid date format', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
      }

      try {
        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (status) updateData.status = status.replace('_', '-');
        if (dueDate) updateData.dueDate = dueDate;

        const task = await Task.findOneAndUpdate(
          { _id: id, userId: context.user._id },
          updateData,
          { new: true, runValidators: true }
        );

        if (!task) {
          throw new GraphQLError('Task not found or access denied', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return {
          success: true,
          message: 'Task updated successfully',
          data: task
        };
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Error updating task', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    },

    deleteTask: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new GraphQLError('Invalid task ID format', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      try {
        const task = await Task.findOneAndDelete({ _id: id, userId: context.user._id });

        if (!task) {
          throw new GraphQLError('Task not found or access denied', {
            extensions: { code: 'NOT_FOUND' }
          });
        }

        return {
          success: true,
          message: 'Task deleted successfully',
          data: task
        };
      } catch (error: any) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Error deleting task', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }
  },

  Task: {
    id: (parent: any) => parent._id.toString(),
    status: (parent: any) => parent.status.replace('-', '_')
  }
};
