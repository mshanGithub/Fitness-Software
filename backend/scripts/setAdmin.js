require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');

const email = process.argv[2]?.trim()?.toLowerCase();

if (!email) {
  console.error('Usage: npm run make-admin -- user@example.com');
  process.exit(1);
}

const run = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`No user found for ${email}`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save({ validateBeforeSave: false });

    console.log(`${email} is now an admin user.`);
    process.exit(0);
  } catch (error) {
    console.error(`Failed to promote admin: ${error.message}`);
    process.exit(1);
  }
};

run();