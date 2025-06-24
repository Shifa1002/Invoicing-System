import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // Join user-specific room
    socket.join(`user:${socket.user._id}`);

    // Join admin room if user is admin
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitDashboardUpdate = (data) => {
  if (io) {
    io.to('admin').emit('dashboard:update', data);
  }
};

export const emitInvoiceUpdate = (invoiceId, data) => {
  if (io) {
    io.to(`invoice:${invoiceId}`).emit('invoice:update', data);
  }
};

export const emitClientUpdate = (clientId, data) => {
  if (io) {
    io.to(`client:${clientId}`).emit('client:update', data);
  }
};

export const emitContractUpdate = (contractId, data) => {
  if (io) {
    io.to(`contract:${contractId}`).emit('contract:update', data);
  }
};

export const emitProductUpdate = (productId, data) => {
  if (io) {
    io.to('admin').emit('product:update', data);
  }
};

export const getIO = () => io; 