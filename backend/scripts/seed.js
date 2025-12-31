const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../dist/models/User.js');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/klassygo');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@klassygo.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Management'
    });
    await admin.save();
    console.log('Created admin user: admin@klassygo.com / admin123');

    // Create sample interns
    const internPassword = await bcrypt.hash('intern123', 12);
    
    const interns = [
      {
        name: 'John Doe',
        email: 'john@klassygo.com',
        password: internPassword,
        role: 'INTERN',
        department: 'Software Development'
      },
      {
        name: 'Jane Smith',
        email: 'jane@klassygo.com',
        password: internPassword,
        role: 'INTERN',
        department: 'Data Science'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@klassygo.com',
        password: internPassword,
        role: 'INTERN',
        department: 'Web Development'
      }
    ];

    for (const internData of interns) {
      const intern = new User(internData);
      await intern.save();
      console.log(`Created intern: ${internData.email} / intern123`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
