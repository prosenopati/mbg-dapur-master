import { db } from '@/db';
import { feedbackEntries } from '@/db/schema';

async function main() {
    const today = new Date();
    
    const getDateDaysAgo = (daysAgo: number): string => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    };
    
    const getFullTimestamp = (daysAgo: number, hour: number, minute: number): string => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        date.setHours(hour, minute, 0, 0);
        return date.toISOString();
    };

    const sampleFeedback = [
        // Kitchen 7 - HIGH PERFORMER (mostly positive)
        {
            dapurId: 7,
            date: getDateDaysAgo(6),
            session: 'pagi',
            feedbackText: 'Makanan sangat lezat dan porsi cukup. Pelayanan cepat!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: getFullTimestamp(6, 7, 30),
        },
        {
            dapurId: 7,
            date: getDateDaysAgo(4),
            session: 'siang',
            feedbackText: 'Kualitas masakan konsisten baik. Terima kasih!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: getFullTimestamp(4, 12, 45),
        },
        {
            dapurId: 7,
            date: getDateDaysAgo(1),
            session: 'malam',
            feedbackText: 'Sayur kurang fresh tapi overall bagus',
            sentiment: 'neutral',
            status: 'in-progress',
            createdAt: getFullTimestamp(1, 18, 20),
        },

        // Kitchen 8 - GOOD PERFORMER (positive with minor feedback)
        {
            dapurId: 8,
            date: getDateDaysAgo(5),
            session: 'pagi',
            feedbackText: 'Nasi pulen dan lauk enak. Memuaskan!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: getFullTimestamp(5, 7, 15),
        },
        {
            dapurId: 8,
            date: getDateDaysAgo(3),
            session: 'siang',
            feedbackText: 'Porsi bisa ditambah sedikit untuk kerja keras',
            sentiment: 'neutral',
            status: 'in-progress',
            createdAt: getFullTimestamp(3, 13, 0),
        },
        {
            dapurId: 8,
            date: getDateDaysAgo(0),
            session: 'malam',
            feedbackText: 'Bumbu pas dan masakan hangat',
            sentiment: 'positive',
            status: 'noted',
            createdAt: getFullTimestamp(0, 19, 10),
        },

        // Kitchen 9 - AVERAGE (mixed feedback)
        {
            dapurId: 9,
            date: getDateDaysAgo(6),
            session: 'pagi',
            feedbackText: 'Makanan cukup enak tapi kadang dingin',
            sentiment: 'neutral',
            status: 'in-progress',
            createdAt: getFullTimestamp(6, 8, 0),
        },
        {
            dapurId: 9,
            date: getDateDaysAgo(4),
            session: 'siang',
            feedbackText: 'Porsi kurang untuk pekerja lapangan',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: getFullTimestamp(4, 12, 30),
        },
        {
            dapurId: 9,
            date: getDateDaysAgo(2),
            session: 'malam',
            feedbackText: 'Hari ini lebih baik dari biasanya',
            sentiment: 'positive',
            status: 'resolved',
            createdAt: getFullTimestamp(2, 18, 45),
        },
        {
            dapurId: 9,
            date: getDateDaysAgo(0),
            session: 'pagi',
            feedbackText: 'Nasi terlalu lembek, perlu diperbaiki',
            sentiment: 'negative',
            status: 'noted',
            createdAt: getFullTimestamp(0, 7, 45),
        },

        // Kitchen 10 - NEEDS IMPROVEMENT (many negative)
        {
            dapurId: 10,
            date: getDateDaysAgo(6),
            session: 'pagi',
            feedbackText: 'Makanan dingin dan kurang bumbu',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: getFullTimestamp(6, 7, 20),
        },
        {
            dapurId: 10,
            date: getDateDaysAgo(5),
            session: 'siang',
            feedbackText: 'Porsi sangat kurang dan rasa hambar',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: getFullTimestamp(5, 12, 15),
        },
        {
            dapurId: 10,
            date: getDateDaysAgo(3),
            session: 'malam',
            feedbackText: 'Ayam tidak matang sempurna, bahaya!',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: getFullTimestamp(3, 19, 0),
        },
        {
            dapurId: 10,
            date: getDateDaysAgo(1),
            session: 'pagi',
            feedbackText: 'Perbaikan sedikit terlihat tapi masih kurang',
            sentiment: 'neutral',
            status: 'noted',
            createdAt: getFullTimestamp(1, 8, 10),
        },

        // Kitchen 11 - MIXED (varying feedback)
        {
            dapurId: 11,
            date: getDateDaysAgo(6),
            session: 'pagi',
            feedbackText: 'Hari ini enak sekali!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: getFullTimestamp(6, 7, 40),
        },
        {
            dapurId: 11,
            date: getDateDaysAgo(5),
            session: 'siang',
            feedbackText: 'Sayur terlalu asin',
            sentiment: 'negative',
            status: 'resolved',
            createdAt: getFullTimestamp(5, 13, 20),
        },
        {
            dapurId: 11,
            date: getDateDaysAgo(3),
            session: 'malam',
            feedbackText: 'Standar saja, tidak istimewa',
            sentiment: 'neutral',
            status: 'noted',
            createdAt: getFullTimestamp(3, 18, 30),
        },
        {
            dapurId: 11,
            date: getDateDaysAgo(1),
            session: 'pagi',
            feedbackText: 'Menu bervariasi dan lezat',
            sentiment: 'positive',
            status: 'noted',
            createdAt: getFullTimestamp(1, 7, 55),
        },
    ];

    await db.insert(feedbackEntries).values(sampleFeedback);
    
    console.log('✅ Feedback entries seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});