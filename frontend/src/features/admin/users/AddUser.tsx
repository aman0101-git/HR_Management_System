import { useState } from 'react';
import { createUserApi } from '../admin.api';

export default function AddUser() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', password: '', role: 'HR'
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      await createUserApi(formData);
      setStatus({ loading: false, error: '', success: 'User created successfully!' });
      setFormData({ firstName: '', lastName: '', username: '', password: '', role: 'HR' }); // Reset
    } catch (err: any) {
      setStatus({ loading: false, error: err.message, success: '' });
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-sm max-w-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Create New User</h2>
      {status.error && <div className="text-red-500 mb-2">{status.error}</div>}
      {status.success && <div className="text-green-500 mb-2">{status.success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-2 border rounded" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
        <input className="w-full p-2 border rounded" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
        <input className="w-full p-2 border rounded" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input className="w-full p-2 border rounded" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        
        <select className="w-full p-2 border rounded" name="role" value={formData.role} onChange={handleChange}>
          <option value="HR">HR</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button type="submit" disabled={status.loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {status.loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}