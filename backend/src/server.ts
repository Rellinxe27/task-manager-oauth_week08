import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import passport from './config/passport';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { AuthRequest, GraphQLContext } from './types';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Apollo GraphQL Server setup
const apolloServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
});

async function startServer() {
    await apolloServer.start();

    // GraphQL endpoint at /api/apollo
    app.use(
        '/api/apollo',
        cors<cors.CorsRequest>({ origin: '*', credentials: true }),
        express.json(),
        expressMiddleware(apolloServer, {
            context: async ({ req }): Promise<GraphQLContext> => {
                const authReq = req as AuthRequest;
                return {
                    req: authReq,
                    user: authReq.user
                };
            }
        })
    );

    // REST API routes
    app.use('/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);

    app.get('/', (req, res) => {
        res.json({
            message: 'Task Manager API with OAuth, GraphQL, and TypeScript',
            endpoints: {
                graphql: '/api/apollo',
                rest: {
                    auth: '/auth',
                    tasks: '/api/tasks'
                }
            },
            authentication: {
                login: '/auth/google',
                logout: '/auth/logout',
                status: '/auth/status',
                profile: '/auth/profile'
            }
        });
    });

    app.get('/dashboard', (req: AuthRequest, res) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                message: 'Please login',
                loginUrl: '/auth/google'
            });
        }

        res.json({
            success: true,
            message: `Welcome ${req.user!.displayName}!`,
            user: {
                email: req.user!.email,
                displayName: req.user!.displayName,
                picture: req.user!.picture
            },
            endpoints: {
                graphql: '/api/apollo',
                tasks: '/api/tasks',
                profile: '/auth/profile',
                logout: '/auth/logout'
            }
        });
    });

    app.get('/login-failed', (req, res) => {
        res.status(401).json({
            success: false,
            message: 'Login failed',
            loginUrl: '/auth/google'
        });
    });

    app.use((req, res) => {
        res.status(404).json({ success: false, message: 'Route not found' });
    });

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GraphQL endpoint: http://localhost:${PORT}/api/apollo`);
        console.log(`Login: http://localhost:${PORT}/auth/google`);

        mongoose.connect(process.env.MONGODB_URI as string)
            .then(() => console.log('MongoDB connected'))
            .catch((err) => console.error('MongoDB error:', err.message));
    });
}

startServer();