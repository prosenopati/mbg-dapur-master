import { db } from '@/db';
import { productionHistory } from '@/db/schema';

async function main() {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Kitchen 1: High Performer - Dapur Central Jakarta
    const kitchen1Data = [
        { target: 480, actual: 495, daysAgo: 7 },
        { target: 480, actual: 490, daysAgo: 6 },
        { target: 480, actual: 498, daysAgo: 5 },
        { target: 480, actual: 502, daysAgo: 4 },
        { target: 480, actual: 492, daysAgo: 3 },
        { target: 480, actual: 488, daysAgo: 2 },
        { target: 480, actual: 505, daysAgo: 1 },
    ];

    // Kitchen 2: Good Performer - Dapur South Jakarta
    const kitchen2Data = [
        { target: 430, actual: 428, daysAgo: 7 },
        { target: 430, actual: 432, daysAgo: 6 },
        { target: 430, actual: 430, daysAgo: 5 },
        { target: 430, actual: 435, daysAgo: 4 },
        { target: 430, actual: 427, daysAgo: 3 },
        { target: 430, actual: 433, daysAgo: 2 },
        { target: 430, actual: 431, daysAgo: 1 },
    ];

    // Kitchen 3: Average Performer - Dapur West Jakarta
    const kitchen3Data = [
        { target: 380, actual: 365, daysAgo: 7 },
        { target: 380, actual: 372, daysAgo: 6 },
        { target: 380, actual: 388, daysAgo: 5 },
        { target: 380, actual: 375, daysAgo: 4 },
        { target: 380, actual: 368, daysAgo: 3 },
        { target: 380, actual: 382, daysAgo: 2 },
        { target: 380, actual: 370, daysAgo: 1 },
    ];

    // Kitchen 4: Needs Improvement - Dapur East Jakarta
    const kitchen4Data = [
        { target: 330, actual: 285, daysAgo: 7 },
        { target: 330, actual: 292, daysAgo: 6 },
        { target: 330, actual: 278, daysAgo: 5 },
        { target: 330, actual: 295, daysAgo: 4 },
        { target: 330, actual: 302, daysAgo: 3 },
        { target: 330, actual: 288, daysAgo: 2 },
        { target: 330, actual: 296, daysAgo: 1 },
    ];

    // Kitchen 5: Mixed Performance - Dapur North Jakarta
    const kitchen5Data = [
        { target: 360, actual: 345, daysAgo: 7 },
        { target: 360, actual: 368, daysAgo: 6 },
        { target: 360, actual: 352, daysAgo: 5 },
        { target: 360, actual: 372, daysAgo: 4 },
        { target: 360, actual: 340, daysAgo: 3 },
        { target: 360, actual: 355, daysAgo: 2 },
        { target: 360, actual: 365, daysAgo: 1 },
    ];

    const allKitchensData = [
        { dapurId: 1, data: kitchen1Data },
        { dapurId: 2, data: kitchen2Data },
        { dapurId: 3, data: kitchen3Data },
        { dapurId: 4, data: kitchen4Data },
        { dapurId: 5, data: kitchen5Data },
    ];

    const sampleProductionHistory = [];

    for (const kitchen of allKitchensData) {
        for (const dayData of kitchen.data) {
            const recordDate = new Date(today);
            recordDate.setDate(today.getDate() - dayData.daysAgo);
            recordDate.setHours(0, 0, 0, 0);

            const dayName = dayNames[recordDate.getDay()];

            sampleProductionHistory.push({
                dapurId: kitchen.dapurId,
                date: recordDate.toISOString().split('T')[0],
                dayName: dayName,
                target: dayData.target,
                actual: dayData.actual,
                createdAt: recordDate.toISOString(),
            });
        }
    }

    await db.insert(productionHistory).values(sampleProductionHistory);
    
    console.log('✅ Production history seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});