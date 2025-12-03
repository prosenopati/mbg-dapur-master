import { db } from '@/db';
import { menuItems } from '@/db/schema';

async function main() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const riceOptions = ['Nasi Putih', 'Nasi Merah', 'Nasi Uduk', 'Nasi Kuning', 'Nasi Liwet'];
    
    const proteinBySession = {
        pagi: ['Ayam Goreng Kunyit', 'Ayam Goreng Lengkuas', 'Ayam Bakar Madu', 'Telur Dadar', 'Ikan Goreng Tepung'],
        siang: ['Ikan Bakar', 'Ikan Pindang', 'Ikan Goreng', 'Ayam Kecap', 'Rendang Daging'],
        malam: ['Rendang Sapi', 'Gulai Ayam', 'Semur Daging', 'Opor Ayam', 'Ayam Goreng Kalasan']
    };
    
    const tofuTempeh = ['Tempe Orek', 'Tempe Goreng', 'Tempe Mendoan', 'Tempe Bacem', 'Tahu Bacem', 'Tahu Goreng', 'Tahu Isi'];
    
    const vegetables = ['Sayur Asem', 'Sayur Sop', 'Sayur Bening', 'Sayur Lodeh', 'Sayur Bayam', 'Tumis Kangkung', 'Tumis Buncis', 'Capcay', 'Tumis Kacang Panjang', 'Tumis Tauge'];
    
    const fruits = ['Pisang', 'Jeruk', 'Pepaya', 'Semangka', 'Melon', 'Apel', 'Jambu Air'];
    
    const sambals = ['Sambal', 'Sambal Terasi', 'Sambal Bawang', 'Sambal Ijo', 'Sambal Merah', 'Sambal Kecap', 'Sambal Hijau'];
    
    const extras = ['Kerupuk', 'Lalapan'];

    const getRandomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];

    const generateMenu = (dapurId: number, session: 'pagi' | 'siang' | 'malam') => {
        const dishes = [
            getRandomItem(riceOptions),
            getRandomItem(proteinBySession[session]),
            getRandomItem(tofuTempeh),
            getRandomItem(vegetables),
            getRandomItem(fruits),
            getRandomItem(sambals),
            getRandomItem(extras)
        ];

        return {
            dapurId,
            date: today,
            session,
            dishes: JSON.stringify(dishes),
            createdAt: now
        };
    };

    const sampleMenuItems = [
        generateMenu(7, 'pagi'),
        generateMenu(7, 'siang'),
        generateMenu(7, 'malam'),
        generateMenu(8, 'pagi'),
        generateMenu(8, 'siang'),
        generateMenu(8, 'malam'),
        generateMenu(9, 'pagi'),
        generateMenu(9, 'siang'),
        generateMenu(9, 'malam'),
        generateMenu(10, 'pagi'),
        generateMenu(10, 'siang'),
        generateMenu(10, 'malam'),
        generateMenu(11, 'pagi'),
        generateMenu(11, 'siang'),
        generateMenu(11, 'malam')
    ];

    await db.insert(menuItems).values(sampleMenuItems);
    
    console.log('✅ Menu items seeder completed successfully - 15 records created for today');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});