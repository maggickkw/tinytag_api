"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@example.com' }
    });
    if (existingAdmin) {
        console.log('👤 Admin user already exists, skipping...');
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true,
        },
        select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        }
    });
    console.log('✅ Admin user created successfully:');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: ADMIN');
    console.log('🆔 ID:', admin.id);
    console.log('🌱 Database seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
