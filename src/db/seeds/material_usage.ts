import { db } from '@/db';
import { materialUsage } from '@/db/schema';

async function main() {
    const sampleMaterialUsage = [];
    
    // Calculate dates for last 7 days
    const today = new Date();
    const dates = [];
    for (let i = 7; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }

    // Kitchen 1 - HIGH PERFORMER (efficient, minimal wastage)
    for (const date of dates) {
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        
        sampleMaterialUsage.push(
            {
                dapurId: 1,
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
                dapurId: 1,
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
                dapurId: 1,
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

    // Kitchen 2 - GOOD PERFORMER (normal variance)
    for (const date of dates) {
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        
        sampleMaterialUsage.push(
            {
                dapurId: 2,
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
                dapurId: 2,
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
                dapurId: 2,
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

    // Kitchen 3 - AVERAGE (some wastage warnings)
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        
        if (i < 3) {
            // Days 1-3
            sampleMaterialUsage.push(
                {
                    dapurId: 3,
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
                    dapurId: 3,
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
                    dapurId: 3,
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
            // Days 4-7
            sampleMaterialUsage.push(
                {
                    dapurId: 3,
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
                    dapurId: 3,
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
                    dapurId: 3,
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

    // Kitchen 4 - NEEDS IMPROVEMENT (high wastage, alerts)
    for (const date of dates) {
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        
        sampleMaterialUsage.push(
            {
                dapurId: 4,
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
                dapurId: 4,
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
                dapurId: 4,
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

    // Kitchen 5 - MIXED (varying performance)
    for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const dateStr = date.toISOString().split('T')[0];
        const createdAt = date.toISOString();
        const dayNumber = i + 1;
        
        if (dayNumber % 2 === 1) {
            // Days 1, 3, 5, 7 - Good performance
            sampleMaterialUsage.push(
                {
                    dapurId: 5,
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
                    dapurId: 5,
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
                    dapurId: 5,
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
            // Days 2, 4, 6 - Warning performance
            sampleMaterialUsage.push(
                {
                    dapurId: 5,
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
                    dapurId: 5,
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
                    dapurId: 5,
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
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});