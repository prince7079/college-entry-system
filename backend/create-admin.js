
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createAdmin() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: 'Admin',
      email: 'admin@college.com',
      password: 'password123',
      role: 'admin',
      department: 'Administration'
    });
    console.log('Admin created successfully:', response.data);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('Admin user already exists. You can login with:');
      console.log('Email: admin@college.com');
      console.log('Password: password123');
    } else {
      console.error('Error creating admin:', error.message);
    }
  }
}

createAdmin();

