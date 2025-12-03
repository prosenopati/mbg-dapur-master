import { db } from '@/db';
import { dapurs } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleDapurs = [
        {
            name: 'Dapur Central Jakarta',
            location: 'Jl. Sudirman No. 123, Jakarta Pusat',
            capacity: 500,
            managerName: 'Budi Santoso',
            contact: '+62 812-3456-7890',
            status: 'active',
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur South Jakarta',
            location: 'Jl. TB Simatupang No. 45, Jakarta Selatan',
            capacity: 450,
            managerName: 'Siti Nurhaliza',
            contact: '+62 813-4567-8901',
            status: 'active',
            createdAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur West Jakarta',
            location: 'Jl. Puri Indah No. 88, Jakarta Barat',
            capacity: 400,
            managerName: 'Ahmad Hidayat',
            contact: '+62 814-5678-9012',
            status: 'active',
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur East Jakarta',
            location: 'Jl. Bekasi Raya No. 234, Jakarta Timur',
            capacity: 350,
            managerName: 'Dewi Lestari',
            contact: '+62 815-6789-0123',
            status: 'active',
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur North Jakarta',
            location: 'Jl. Ancol No. 56, Jakarta Utara',
            capacity: 380,
            managerName: 'Rudi Wijaya',
            contact: '+62 816-7890-1234',
            status: 'active',
            createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    await db.insert(dapurs).values(sampleDapurs);
    
    console.log('✅ Dapurs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});