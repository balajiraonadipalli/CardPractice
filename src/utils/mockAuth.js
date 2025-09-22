// Mock authentication for testing when backend is not available
const mockUsers = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123456',
    role: 'admin',
    emailVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123456',
    role: 'user',
    emailVerified: true,
    createdAt: new Date().toISOString()
  }
];

export const mockAuthService = {
  async login(credentials) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }
    
    const { password, ...userData } = user;
    const accessToken = `mock-token-${Date.now()}`;
    
    return {
      success: true,
      user: userData,
      accessToken,
      message: 'Login successful'
    };
  },

  async register(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    const newUser = {
      _id: String(mockUsers.length + 1),
      ...userData,
      role: 'user',
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    const { password, ...userResponse } = newUser;
    const accessToken = `mock-token-${Date.now()}`;
    
    return {
      success: true,
      user: userResponse,
      accessToken,
      message: 'Registration successful'
    };
  },

  async logout() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Logout successful' };
  },

  async refreshToken() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      accessToken: `mock-token-${Date.now()}`,
      message: 'Token refreshed'
    };
  },

  async getProfile(token) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For mock, just return a user based on token
    const userData = mockUsers[0]; // Return admin user for testing
    const { password, ...userResponse } = userData;
    
    return userResponse;
  }
};
