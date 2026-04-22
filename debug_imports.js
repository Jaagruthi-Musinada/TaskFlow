try {
    const express = require('express');
    console.log('Express imported');
    const { PrismaClient } = require('@prisma/client');
    console.log('Prisma imported');
    const prisma = new PrismaClient();
    console.log('Prisma client initialized');
} catch (err) {
    console.error('Import error:', err);
}
