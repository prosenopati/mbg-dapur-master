import { db } from '@/db';
import { menuItems } from '@/db/schema';

async function main() {
    const today = new Date().toISOString().split('T')[0];
    const currentTimestamp = new Date().toISOString();

    const sampleMenuItems = [
        // Dapur MBG Kendal Kota (dapurId: 7)
        {
            dapurId: 7,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Goreng Kunyit", "Tempe Orek", "Sayur Asem", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 7,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Bakar", "Tahu Bacem", "Tumis Kangkung", "Sambal Terasi", "Lalapan"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 7,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Rendang Sapi", "Perkedel Kentang", "Sayur Lodeh", "Sambal Ijo", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        // Dapur MBG Weleri (dapurId: 8)
        {
            dapurId: 8,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Goreng Lengkuas", "Tempe Goreng", "Sayur Sop", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 8,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Pindang", "Tahu Goreng", "Tumis Buncis", "Sambal Bawang", "Lalapan"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 8,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Gulai Ayam", "Perkedel Jagung", "Sayur Bayam", "Sambal Merah", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        // Dapur MBG Kaliwungu (dapurId: 9)
        {
            dapurId: 9,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Bakar", "Tempe Mendoan", "Sayur Bening", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 9,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Goreng", "Tahu Isi", "Capcay", "Sambal Kecap", "Lalapan"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 9,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Semur Daging", "Bakwan Sayur", "Sayur Asem", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        // Dapur MBG Patebon (dapurId: 10)
        {
            dapurId: 10,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Goreng", "Tempe Bacem", "Sayur Oyong", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 10,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Asin", "Tahu Goreng", "Tumis Tauge", "Sambal", "Lalapan"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 10,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Opor Ayam", "Perkedel", "Sayur Lodeh", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        // Dapur MBG Cepiring (dapurId: 11)
        {
            dapurId: 11,
            date: today,
            session: 'pagi',
            dishes: ["Nasi Putih", "Ayam Kecap", "Tempe Goreng", "Sayur Sop", "Sambal", "Kerupuk"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 11,
            date: today,
            session: 'siang',
            dishes: ["Nasi Putih", "Ikan Bumbu Kuning", "Tahu Bacem", "Tumis Kacang Panjang", "Sambal", "Lalapan"],
            createdAt: currentTimestamp,
        },
        {
            dapurId: 11,
            date: today,
            session: 'malam',
            dishes: ["Nasi Putih", "Ayam Goreng Kalasan", "Bakwan Udang", "Sayur Asem", "Sambal Hijau", "Kerupuk"],
            createdAt: currentTimestamp,
        },
    ];

    await db.insert(menuItems).values(sampleMenuItems);
    
    console.log('✅ Menu items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});