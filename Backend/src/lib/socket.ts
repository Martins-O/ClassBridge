import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import { getUserIdFromCookie } from './session';

let io: SocketIOServer | null = null;

export function setupSocketIO(httpServer: http.Server): SocketIOServer {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST']
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.use((socket, next) => {
        const userId = getUserIdFromCookie(socket.request.headers.cookie || '');
        
        if (userId) {
            socket.data.userId = userId;
            next();
        } else {
            const token = socket.handshake.auth.token;
            if (token) {
                socket.data.userId = token;
                next();
            } else {
                next(new Error('Authentication required'));
            }
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.userId;
        
        if (userId) {
            socket.join(`user:${userId}`);
            console.log(`User ${userId} connected to socket`);
        }

        socket.on('join-room', (room: string) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room: ${room}`);
        });

        socket.on('leave-room', (room: string) => {
            socket.leave(room);
            console.log(`Socket ${socket.id} left room: ${room}`);
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected from socket`);
        });
    });

    console.log('Socket.io initialized');
    return io;
}

export function getIO(): SocketIOServer | null {
    return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
}

export function emitToRoom(room: string, event: string, data: unknown): void {
    if (io) {
        io.to(room).emit(event, data);
    }
}

export function emitNotification(userId: string, notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    createdAt: Date;
}): void {
    emitToUser(userId, 'notification', notification);
}
