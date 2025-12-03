import { db } from '@/db';
import { materialUsage } from '@/db/schema';

async function main() {
    const materials = [
        { name: 'Beras Premium', unit: 'kg' },
        { name: 'Ayam Potong', unit: 'kg' },
        { name: 'Sayuran Segar', unit: 'kg' }
    ];

    const sampleMaterialUsage = [];
    const today = new Date();

    // Kitchen 7 - HIGH PERFORMER (efficient, minimal wastage)
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();

        sampleMaterialUsage.push(
            {
                dapurId: 7,
                date: dateStr,
                materialName: 'Beras Premium',
                unit: 'kg',
                standardAmount: 120.0,
                actualAmount: 118.5,
                variance: -1.5,
                status: 'normal',
                createdAt: createdAt,
            },
            {
                dapurId: 7,
                date: dateStr,
                materialName: 'Ayam Potong',
                unit: 'kg',
                standardAmount: 80.0,
                actualAmount: 79.2,
                variance: -0.8,
                status: 'normal',
                createdAt: createdAt,
            },
            {
                dapurId: 7,
                date: dateStr,
                materialName: 'Sayuran Segar',
                unit: 'kg',
                standardAmount: 60.0,
                actualAmount: 59.5,
                variance: -0.5,
                status: 'normal',
                createdAt: createdAt,
            }
        );
    }

    // Kitchen 8 - GOOD PERFORMER (normal variance)
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();

        sampleMaterialUsage.push(
            {
                dapurId: 8,
                date: dateStr,
                materialName: 'Beras Premium',
                unit: 'kg',
                standardAmount: 110.0,
                actualAmount: 110.8,
                variance: 0.8,
                status: 'normal',
                createdAt: createdAt,
            },
            {
                dapurId: 8,
                date: dateStr,
                materialName: 'Ayam Potong',
                unit: 'kg',
                standardAmount: 70.0,
                actualAmount: 70.5,
                variance: 0.5,
                status: 'normal',
                createdAt: createdAt,
            },
            {
                dapurId: 8,
                date: dateStr,
                materialName: 'Sayuran Segar',
                unit: 'kg',
                standardAmount: 55.0,
                actualAmount: 55.3,
                variance: 0.3,
                status: 'normal',
                createdAt: createdAt,
            }
        );
    }

    // Kitchen 9 - AVERAGE (some wastage)
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        const dayNumber = 8 - dayOffset;

        if (dayNumber <= 3) {
            sampleMaterialUsage.push(
                {
                    dapurId: 9,
                    date: dateStr,
                    materialName: 'Beras Premium',
                    unit: 'kg',
                    standardAmount: 95.0,
                    actualAmount: 97.5,
                    variance: 2.5,
                    status: 'warning',
                    createdAt: createdAt,
                },
                {
                    dapurId: 9,
                    date: dateStr,
                    materialName: 'Ayam Potong',
                    unit: 'kg',
                    standardAmount: 60.0,
                    actualAmount: 62.0,
                    variance: 2.0,
                    status: 'warning',
                    createdAt: createdAt,
                },
                {
                    dapurId: 9,
                    date: dateStr,
                    materialName: 'Sayuran Segar',
                    unit: 'kg',
                    standardAmount: 50.0,
                    actualAmount: 51.5,
                    variance: 1.5,
                    status: 'normal',
                    createdAt: createdAt,
                }
            );
        } else {
            sampleMaterialUsage.push(
                {
                    dapurId: 9,
                    date: dateStr,
                    materialName: 'Beras Premium',
                    unit: 'kg',
                    standardAmount: 95.0,
                    actualAmount: 98.0,
                    variance: 3.0,
                    status: 'warning',
                    createdAt: createdAt,
                },
                {
                    dapurId: 9,
                    date: dateStr,
                    materialName: 'Ayam Potong',
                    unit: 'kg',
                    standardAmount: 60.0,
                    actualAmount: 61.8,
                    variance: 1.8,
                    status: 'normal',
                    createdAt: createdAt,
                },
                {
                    dapurId: 9,
                    date: dateStr,
                    materialName: 'Sayuran Segar',
                    unit: 'kg',
                    standardAmount: 50.0,
                    actualAmount: 51.0,
                    variance: 1.0,
                    status: 'normal',
                    createdAt: createdAt,
                }
            );
        }
    }

    // Kitchen 10 - NEEDS IMPROVEMENT (high wastage)
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();

        sampleMaterialUsage.push(
            {
                dapurId: 10,
                date: dateStr,
                materialName: 'Beras Premium',
                unit: 'kg',
                standardAmount: 85.0,
                actualAmount: 92.0,
                variance: 7.0,
                status: 'alert',
                createdAt: createdAt,
            },
            {
                dapurId: 10,
                date: dateStr,
                materialName: 'Ayam Potong',
                unit: 'kg',
                standardAmount: 55.0,
                actualAmount: 60.5,
                variance: 5.5,
                status: 'alert',
                createdAt: createdAt,
            },
            {
                dapurId: 10,
                date: dateStr,
                materialName: 'Sayuran Segar',
                unit: 'kg',
                standardAmount: 45.0,
                actualAmount: 49.0,
                variance: 4.0,
                status: 'warning',
                createdAt: createdAt,
            }
        );
    }

    // Kitchen 11 - MIXED (varying performance)
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        const dayNumber = 8 - dayOffset;

        if (dayNumber % 2 === 1) {
            sampleMaterialUsage.push(
                {
                    dapurId: 11,
                    date: dateStr,
                    materialName: 'Beras Premium',
                    unit: 'kg',
                    standardAmount: 90.0,
                    actualAmount: 91.5,
                    variance: 1.5,
                    status: 'normal',
                    createdAt: createdAt,
                },
                {
                    dapurId: 11,
                    date: dateStr,
                    materialName: 'Ayam Potong',
                    unit: 'kg',
                    standardAmount: 58.0,
                    actualAmount: 59.0,
                    variance: 1.0,
                    status: 'normal',
                    createdAt: createdAt,
                },
                {
                    dapurId: 11,
                    date: dateStr,
                    materialName: 'Sayuran Segar',
                    unit: 'kg',
                    standardAmount: 48.0,
                    actualAmount: 48.8,
                    variance: 0.8,
                    status: 'normal',
                    createdAt: createdAt,
                }
            );
        } else {
            sampleMaterialUsage.push(
                {
                    dapurId: 11,
                    date: dateStr,
                    materialName: 'Beras Premium',
                    unit: 'kg',
                    standardAmount: 90.0,
                    actualAmount: 94.5,
                    variance: 4.5,
                    status: 'warning',
                    createdAt: createdAt,
                },
                {
                    dapurId: 11,
                    date: dateStr,
                    materialName: 'Ayam Potong',
                    unit: 'kg',
                    standardAmount: 58.0,
                    actualAmount: 62.0,
                    variance: 4.0,
                    status: 'warning',
                    createdAt: createdAt,
                },
                {
                    dapurId: 11,
                    date: dateStr,
                    materialName: 'Sayuran Segar',
                    unit: 'kg',
                    standardAmount: 48.0,
                    actualAmount: 51.0,
                    variance: 3.0,
                    status: 'warning',
                    createdAt: createdAt,
                }
            );
        }
    }

    await db.insert(materialUsage).values(sampleMaterialUsage);
    
    console.log('✅ Material usage seeder completed successfully');
    console.log(`📊 Total records created: ${sampleMaterialUsage.length}`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});