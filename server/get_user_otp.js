const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getOTP() {
    const email = 'jaagruthi.23bce9750@vitapstudent.ac.in';
    const user = await prisma.user.findUnique({
        where: { email }
    });
    
    if (user) {
        console.log('--- User Info ---');
        console.log(JSON.stringify(user, null, 2));
        console.log('-------------------------');
    } else {
        console.log(`User ${email} not found.`);
        // List all users to see if there's a casing mismatch
        const allUsers = await prisma.user.findMany({ select: { email: true } });
        console.log('All users in DB:', allUsers.map(u => u.email));
    }
}

getOTP().finally(() => prisma.$disconnect());
