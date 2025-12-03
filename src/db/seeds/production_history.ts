import { db } from '@/db';
import { productionHistory } from '@/db/schema';

async function main() {
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Kitchen 7 - HIGH PERFORMER
    const kitchen7Actuals = [495, 490, 498, 502, 492, 488, 505];
    
    // Kitchen 8 - GOOD PERFORMER
    const kitchen8Actuals = [428, 432, 430, 435, 427, 433, 431];
    
    // Kitchen 9 - AVERAGE
    const kitchen9Actuals = [365, 372, 388, 375, 368, 382, 370];
    
    // Kitchen 10 - NEEDS IMPROVEMENT
    const kitchen10Actuals = [285, 292, 278, 295, 302, 288, 296];
    
    // Kitchen 11 - MIXED PERFORMANCE
    const kitchen11Actuals = [345, 368, 352, 372, 340, 355, 365];
    
    const sampleProductionHistory = [];
    
    // Generate data for 7 days (from 7 days ago to yesterday)
    for (let dayOffset = 7; dayOffset >= 1; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        const createdAt = date.toISOString();
        const arrayIndex = 7 - dayOffset;
        
        // Kitchen 7 - HIGH PERFORMER
        sampleProductionHistory.push({
            dapurId: 7,
            date: dateStr,
            dayName: dayName,
            target: 480,
            actual: kitchen7Actuals[arrayIndex],
            createdAt: createdAt,
        });
        
        // Kitchen 8 - GOOD PERFORMER
        sampleProductionHistory.push({
            dapurId: 8,
            date: dateStr,
            dayName: dayName,
            target: 430,
            actual: kitchen8Actuals[arrayIndex],
            createdAt: createdAt,
        });
        
        // Kitchen 9 - AVERAGE
        sampleProductionHistory.push({
            dapurId: 9,
            date: dateStr,
            dayName: dayName,
            target: 380,
            actual: kitchen9Actuals[arrayIndex],
            createdAt: createdAt,
        });
        
        // Kitchen 10 - NEEDS IMPROVEMENT
        sampleProductionHistory.push({
            dapurId: 10,
            date: dateStr,
            dayName: dayName,
            target: 330,
            actual: kitchen10Actuals[arrayIndex],
            createdAt: createdAt,
        });
        
        // Kitchen 11 - MIXED PERFORMANCE
        sampleProductionHistory.push({
            dapurId: 11,
            date: dateStr,
            dayName: dayName,
            target: 360,
            actual: kitchen11Actuals[arrayIndex],
            createdAt: createdAt,
        });
    }
    
    await db.insert(productionHistory).values(sampleProductionHistory);
    
    console.log('✅ Production history seeder completed successfully - 35 records created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});