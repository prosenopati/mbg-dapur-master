import { db } from '@/db';
import { dapurs } from '@/db/schema';

async function main() {
    const now = new Date();
    
    const sampleDapurs = [
        {
            name: 'Dapur MBG Kendal Kota',
            location: 'Jl. Soekarno Hatta No. 15, Kendal Kota, Kab. Kendal',
            capacity: 500,
            managerName: 'Budi Santoso',
            contact: '+62 812-3456-7890',
            status: 'active',
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur MBG Weleri',
            location: 'Jl. Raya Weleri No. 88, Weleri, Kab. Kendal',
            capacity: 450,
            managerName: 'Siti Nurhaliza',
            contact: '+62 813-4567-8901',
            status: 'active',
            createdAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur MBG Kaliwungu',
            location: 'Jl. Pemuda No. 45, Kaliwungu, Kab. Kendal',
            capacity: 400,
            managerName: 'Ahmad Hidayat',
            contact: '+62 814-5678-9012',
            status: 'active',
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur MBG Patebon',
            location: 'Jl. Pantura KM 15, Patebon, Kab. Kendal',
            capacity: 350,
            managerName: 'Dewi Lestari',
            contact: '+62 815-6789-0123',
            status: 'active',
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            name: 'Dapur MBG Cepiring',
            location: 'Jl. Raya Cepiring No. 120, Cepiring, Kab. Kendal',
            capacity: 380,
            managerName: 'Rudi Wijaya',
            contact: '+62 816-7890-1234',
            status: 'active',
            createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ];

    await db.insert(dapurs).values(sampleDapurs);
    
    console.log('✅ Dapurs seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});