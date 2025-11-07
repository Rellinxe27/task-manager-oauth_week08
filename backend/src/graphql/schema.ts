export const typeDefs = `#graphql
  type User {
    id: ID!
    googleId: String!
    email: String!
    displayName: String!
    firstName: String
    lastName: String
    picture: String
    createdAt: String!
    lastLogin: String!
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    status: TaskStatus!
    dueDate: String!
    userId: String!
    createdAt: String!
  }

  enum TaskStatus {
    pending
    in_progress
    completed
  }

  input CreateTaskInput {
    title: String!
    description: String!
    status: TaskStatus
    dueDate: String!
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: TaskStatus
    dueDate: String
  }

  type TaskResponse {
    success: Boolean!
    message: String
    data: Task
  }

  type TasksResponse {
    success: Boolean!
    count: Int!
    data: [Task!]!
  }

  type Query {
    me: User
    tasks: TasksResponse!
    task(id: ID!): TaskResponse!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): TaskResponse!
    updateTask(id: ID!, input: UpdateTaskInput!): TaskResponse!
    deleteTask(id: ID!): TaskResponse!
  }
`;
