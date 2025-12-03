import { db } from '@/db';
import { menuItems } from '@/db/schema';

async function main() {
    const pagiOptions = {
        protein: ["Ayam Goreng Bumbu Kuning", "Telur Dadar Isi", "Ayam Ungkep Kecap"],
        tempe: ["Tempe Orek", "Tahu Bacem", "Tempe Mendoan"],
        vegetable: ["Sayur Sop", "Sayur Bayam", "Tumis Kangkung"],
        fruit: ["Pisang", "Jeruk", "Pepaya"]
    };

    const siangOptions = {
        protein: ["Ikan Goreng Tepung", "Rendang Daging", "Ayam Bakar Madu"],
        tempe: ["Tahu Goreng", "Tempe Penyet", "Tahu Isi"],
        vegetable: ["Sayur Asem", "Sayur Lodeh", "Capcay"],
        fruit: ["Semangka", "Melon", "Apel"]
    };

    const malamOptions = {
        protein: ["Sate Ayam", "Ikan Bumbu Kuning", "Ayam Suwir Pedas"],
        tempe: ["Tempe Goreng", "Tahu Crispy", "Tempe Kering"],
        vegetable: ["Sayur Bening", "Tumis Buncis", "Oseng Terong"],
        fruit: ["Nanas", "Anggur", "Pir"]
    };

    const getRandomItem = (array: string[]) => {
        return array[Math.floor(Math.random() * array.length)];
    };

    const generateMenuForSession = (session: 'pagi' | 'siang' | 'malam') => {
        if (session === 'pagi') {
            return [
                "Nasi Putih",
                getRandomItem(pagiOptions.protein),
                getRandomItem(pagiOptions.tempe),
                getRandomItem(pagiOptions.vegetable),
                getRandomItem(pagiOptions.fruit),
                "Sambal dan Kerupuk"
            ];
        } else if (session === 'siang') {
            return [
                "Nasi Putih",
                getRandomItem(siangOptions.protein),
                getRandomItem(siangOptions.tempe),
                getRandomItem(siangOptions.vegetable),
                getRandomItem(siangOptions.fruit),
                "Sambal dan Kerupuk"
            ];
        } else {
            return [
                "Nasi Putih",
                getRandomItem(malamOptions.protein),
                getRandomItem(malamOptions.tempe),
                getRandomItem(malamOptions.vegetable),
                getRandomItem(malamOptions.fruit),
                "Sambal dan Kerupuk"
            ];
        }
    };

    const kitchenIds = [7, 8, 9, 10, 11];
    const sessions: Array<'pagi' | 'siang' | 'malam'> = ['pagi', 'siang', 'malam'];
    const date = '2025-11-29';
    const createdAt = '2025-11-29T00:00:00.000Z';

    const sampleMenuItems = [];

    for (const dapurId of kitchenIds) {
        for (const session of sessions) {
            sampleMenuItems.push({
                dapurId,
                date,
                session,
                dishes: generateMenuForSession(session),
                createdAt
            });
        }
    }

    await db.insert(menuItems).values(sampleMenuItems);
    
    console.log('✅ Menu items seeder completed successfully');
    console.log(`   Generated ${sampleMenuItems.length} menu items for date ${date}`);
    console.log(`   Kitchens: ${kitchenIds.join(', ')}`);
    console.log(`   Sessions: ${sessions.join(', ')}`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});