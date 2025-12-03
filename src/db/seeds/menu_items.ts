import { db } from '@/db';
import { menuItems } from '@/db/schema';

async function main() {
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    const sampleMenuItems = [
        // Kitchen 1 - Dapur Central Jakarta
        {
            dapurId: 1,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Goreng Kunyit", "Tempe Orek", "Sayur Asem", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        {
            dapurId: 1,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Bakar", "Tahu Bacem", "Tumis Kangkung", "Sambal Terasi", "Lalapan"],
            createdAt: timestamp,
        },
        {
            dapurId: 1,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Rendang Sapi", "Perkedel Kentang", "Sayur Lodeh", "Sambal Ijo", "Kerupuk"],
            createdAt: timestamp,
        },
        // Kitchen 2 - Dapur South Jakarta
        {
            dapurId: 2,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Goreng Lengkuas", "Tempe Goreng", "Sayur Sop", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        {
            dapurId: 2,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Pindang", "Tahu Goreng", "Tumis Buncis", "Sambal Bawang", "Lalapan"],
            createdAt: timestamp,
        },
        {
            dapurId: 2,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Gulai Ayam", "Perkedel Jagung", "Sayur Bayam", "Sambal Merah", "Kerupuk"],
            createdAt: timestamp,
        },
        // Kitchen 3 - Dapur West Jakarta
        {
            dapurId: 3,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Bakar", "Tempe Mendoan", "Sayur Bening", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        {
            dapurId: 3,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Goreng", "Tahu Isi", "Capcay", "Sambal Kecap", "Lalapan"],
            createdAt: timestamp,
        },
        {
            dapurId: 3,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Semur Daging", "Bakwan Sayur", "Sayur Asem", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        // Kitchen 4 - Dapur East Jakarta
        {
            dapurId: 4,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Goreng", "Tempe Bacem", "Sayur Oyong", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        {
            dapurId: 4,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Asin", "Tahu Goreng", "Tumis Tauge", "Sambal", "Lalapan"],
            createdAt: timestamp,
        },
        {
            dapurId: 4,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Opor Ayam", "Perkedel", "Sayur Lodeh", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        // Kitchen 5 - Dapur North Jakarta
        {
            dapurId: 5,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Kecap", "Tempe Goreng", "Sayur Sop", "Sambal", "Kerupuk"],
            createdAt: timestamp,
        },
        {
            dapurId: 5,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Bumbu Kuning", "Tahu Bacem", "Tumis Kacang Panjang", "Sambal", "Lalapan"],
            createdAt: timestamp,
        },
        {
            dapurId: 5,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Ayam Goreng Kalasan", "Bakwan Udang", "Sayur Asem", "Sambal Hijau", "Kerupuk"],
            createdAt: timestamp,
        },
    ];

    await db.insert(menuItems).values(sampleMenuItems);
    
    console.log('✅ Menu items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});