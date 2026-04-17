const User = require('../models/User');

const syncAdminFromEnv = async () => {
  const email = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME?.trim() || 'TWC';
  const lastName = process.env.ADMIN_LAST_NAME?.trim() || 'Admin';

  if (!email || !password) {
    return;
  }

  const existingUser = await User.findOne({ email }).select('+password');

  if (!existingUser) {
    await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'admin',
      isActive: true,
      fitnessGoal: 'general_fitness',
      fitnessLevel: 'advanced',
    });
    console.log(`Admin account created from env for ${email}`);
    return;
  }

  existingUser.firstName = firstName;
  existingUser.lastName = lastName;
  existingUser.role = 'admin';
  existingUser.isActive = true;

  if (!(await existingUser.comparePassword(password))) {
    existingUser.password = password;
  }

  await existingUser.save();
  console.log(`Admin account synced from env for ${email}`);
};

module.exports = syncAdminFromEnv;