import mongoose from 'mongoose';
import School from '../models/School';
import SchoolApproval from '../models/SchoolApproval';
import User from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/classbridge-development';

async function approveAllPendingSchools() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    // First, check for school admins without schools
    const allAdmins = await User.find({ role: 'school_admin' });
    const orphanAdmins = allAdmins.filter((admin: any) => !admin.schoolId);
    console.log(`Found ${orphanAdmins.length} school admin(s) without schools\n`);

    for (const admin of orphanAdmins) {
      console.log(`Processing: ${admin.name} (${admin.email})`);
      
      // Create a school for this admin
      const schoolName = `${admin.name}'s School`;
      const school = await School.create({
        name: schoolName,
        email: admin.email,
        adminId: admin._id,
        status: 'approved',
        approvedAt: new Date(),
        isActive: true,
      });

      // Update the user with schoolId
      admin.schoolId = school._id;
      admin.isApproved = true;
      await admin.save();

      // Create an approval record
      await SchoolApproval.create({
        schoolId: school._id,
        schoolName: school.name,
        schoolEmail: admin.email,
        requestedBy: admin._id,
        adminName: admin.name,
        status: 'approved',
        approvedAt: new Date(),
      });

      console.log(`  - Created school: ${schoolName}`);
      console.log(`  - Linked user to school`);
      console.log(`  - User isApproved: true\n`);
    }

    // Now approve all pending schools
    const pendingSchools = await School.find({ status: 'pending' });
    console.log(`Found ${pendingSchools.length} pending school(s)\n`);

    for (const school of pendingSchools) {
      console.log(`Approving: ${school.name} (${school.email})`);
      
      school.status = 'approved';
      school.approvedAt = new Date();
      await school.save();

      const approval = await SchoolApproval.findOne({ schoolId: school._id, status: 'pending' });
      if (approval) {
        approval.status = 'approved';
        approval.approvedAt = new Date();
        approval.adminId = school.adminId;
        await approval.save();
      }

      const adminUser = await User.findOne({ _id: school.adminId });
      if (adminUser) {
        adminUser.isApproved = true;
        await adminUser.save();
        console.log(`  - Updated admin: ${adminUser.email}`);
      }

      console.log(`  - Status changed to: approved\n`);
    }

    // Verify final state
    const finalAdmins = await User.find({ role: 'school_admin' });
    console.log('Final state of school admins:');
    for (const admin of finalAdmins) {
      console.log(`  - ${admin.email}: schoolId=${admin.schoolId}, isApproved=${admin.isApproved}`);
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
}

approveAllPendingSchools();
