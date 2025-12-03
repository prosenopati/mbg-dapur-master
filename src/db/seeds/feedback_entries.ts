import { db } from '@/db';
import { feedbackEntries } from '@/db/schema';

async function main() {
    const today = new Date();
    const getLast7Days = (dayOffset: number): string => {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        return date.toISOString().split('T')[0];
    };

    const sampleFeedback = [
        // Kitchen 1 (HIGH PERFORMER - mostly positive)
        {
            dapurId: 1,
            date: getLast7Days(6),
            session: 'pagi',
            feedbackText: 'Makanan sangat lezat dan porsi cukup. Pelayanan cepat!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: new Date(getLast7Days(6) + 'T07:30:00').toISOString(),
        },
        {
            dapurId: 1,
            date: getLast7Days(4),
            session: 'siang',
            feedbackText: 'Kualitas masakan konsisten baik. Terima kasih!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: new Date(getLast7Days(4) + 'T12:45:00').toISOString(),
        },
        {
            dapurId: 1,
            date: getLast7Days(1),
            session: 'malam',
            feedbackText: 'Sayur kurang fresh tapi overall bagus',
            sentiment: 'neutral',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(1) + 'T18:20:00').toISOString(),
        },

        // Kitchen 2 (GOOD PERFORMER - positive with minor feedback)
        {
            dapurId: 2,
            date: getLast7Days(5),
            session: 'pagi',
            feedbackText: 'Nasi pulen dan lauk enak. Memuaskan!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: new Date(getLast7Days(5) + 'T07:15:00').toISOString(),
        },
        {
            dapurId: 2,
            date: getLast7Days(3),
            session: 'siang',
            feedbackText: 'Porsi bisa ditambah sedikit untuk kerja keras',
            sentiment: 'neutral',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(3) + 'T13:00:00').toISOString(),
        },
        {
            dapurId: 2,
            date: getLast7Days(0),
            session: 'malam',
            feedbackText: 'Bumbu pas dan masakan hangat',
            sentiment: 'positive',
            status: 'noted',
            createdAt: new Date(getLast7Days(0) + 'T19:10:00').toISOString(),
        },

        // Kitchen 3 (AVERAGE - mixed feedback)
        {
            dapurId: 3,
            date: getLast7Days(6),
            session: 'pagi',
            feedbackText: 'Makanan cukup enak tapi kadang dingin',
            sentiment: 'neutral',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(6) + 'T08:00:00').toISOString(),
        },
        {
            dapurId: 3,
            date: getLast7Days(4),
            session: 'siang',
            feedbackText: 'Porsi kurang untuk pekerja lapangan',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(4) + 'T12:30:00').toISOString(),
        },
        {
            dapurId: 3,
            date: getLast7Days(2),
            session: 'malam',
            feedbackText: 'Hari ini lebih baik dari biasanya',
            sentiment: 'positive',
            status: 'resolved',
            createdAt: new Date(getLast7Days(2) + 'T18:45:00').toISOString(),
        },
        {
            dapurId: 3,
            date: getLast7Days(0),
            session: 'pagi',
            feedbackText: 'Nasi terlalu lembek, perlu diperbaiki',
            sentiment: 'negative',
            status: 'noted',
            createdAt: new Date(getLast7Days(0) + 'T07:45:00').toISOString(),
        },

        // Kitchen 4 (NEEDS IMPROVEMENT - many negative)
        {
            dapurId: 4,
            date: getLast7Days(6),
            session: 'pagi',
            feedbackText: 'Makanan dingin dan kurang bumbu',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(6) + 'T07:20:00').toISOString(),
        },
        {
            dapurId: 4,
            date: getLast7Days(5),
            session: 'siang',
            feedbackText: 'Porsi sangat kurang dan rasa hambar',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(5) + 'T12:15:00').toISOString(),
        },
        {
            dapurId: 4,
            date: getLast7Days(3),
            session: 'malam',
            feedbackText: 'Ayam tidak matang sempurna, bahaya!',
            sentiment: 'negative',
            status: 'in-progress',
            createdAt: new Date(getLast7Days(3) + 'T19:00:00').toISOString(),
        },
        {
            dapurId: 4,
            date: getLast7Days(1),
            session: 'pagi',
            feedbackText: 'Perbaikan sedikit terlihat tapi masih kurang',
            sentiment: 'neutral',
            status: 'noted',
            createdAt: new Date(getLast7Days(1) + 'T08:10:00').toISOString(),
        },

        // Kitchen 5 (MIXED - varying feedback)
        {
            dapurId: 5,
            date: getLast7Days(6),
            session: 'pagi',
            feedbackText: 'Hari ini enak sekali!',
            sentiment: 'positive',
            status: 'noted',
            createdAt: new Date(getLast7Days(6) + 'T07:40:00').toISOString(),
        },
        {
            dapurId: 5,
            date: getLast7Days(5),
            session: 'siang',
            feedbackText: 'Sayur terlalu asin',
            sentiment: 'negative',
            status: 'resolved',
            createdAt: new Date(getLast7Days(5) + 'T13:20:00').toISOString(),
        },
        {
            dapurId: 5,
            date: getLast7Days(3),
            session: 'malam',
            feedbackText: 'Standar saja, tidak istimewa',
            sentiment: 'neutral',
            status: 'noted',
            createdAt: new Date(getLast7Days(3) + 'T18:30:00').toISOString(),
        },
        {
            dapurId: 5,
            date: getLast7Days(1),
            session: 'pagi',
            feedbackText: 'Menu bervariasi dan lezat',
            sentiment: 'positive',
            status: 'noted',
            createdAt: new Date(getLast7Days(1) + 'T07:55:00').toISOString(),
        },
    ];

    await db.insert(feedbackEntries).values(sampleFeedback);
    
    console.log('✅ Feedback entries seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});