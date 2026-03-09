// auth.api.ts
import axios from 'axios';
import type { LoginRequest } from '@/contracts/auth';

const API_BASE = 'http://localhost:8080';

export async function login(payload: LoginRequest): Promise<void> {
  await axios.post(
    `${API_BASE}/auth/login`,
    payload,
    { withCredentials: true }
  );
}
