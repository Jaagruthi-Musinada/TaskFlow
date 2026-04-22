const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bypassUser() {
    const email = 'jaagruthi.23bce9750@vitapstudent.ac.in';
    const otp = '123456';
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    const user = await prisma.user.update({
        where: { email },
        data: {
            isVerified: true,
            mfaToken: otp,
            mfaTokenExpiry: expiry,
            verificationToken: null,
            verificationTokenExpiry: null
        }
    });

    console.log(`--- BYPASS SUCCESS ---`);
    console.log(`User: ${user.email}`);
    console.log(`Status: VERIFIED`);
    console.log(`MFA CODE SET TO: ${otp}`);
    console.log('-----------------------');
}

bypassUser().finally(() => prisma.$disconnect());
