// backend/src/modules/users/user.controller.ts
import { Request, Response } from 'express';
import { createUser } from '../auth/auth.service.js';

export async function createUserController(req: Request, res: Response) {
  try {
    // FIX: Changed .userId to .id to match your auth.middleware.ts
    const adminId = (req as any).user.id; 
    
    const { firstName, lastName, username, password, role } = req.body;

    if (!firstName || !lastName || !username || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await createUser(adminId, firstName, lastName, username, password, role);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    // This console.log will print the exact database error in your backend terminal
    console.error("Error creating user:", error); 
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
  }
}