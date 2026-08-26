import { prisma as db } from '../src/lib/prisma';
import { normalizeString } from '../src/modules/geography/domain/normalize-string';

async function main() {
  // Helper function for seed since name is not unique
  const getOrCreateRate = async (rateName: string, ratePrice: number) => {
    const existing = await db.shippingRate.findFirst({ where: { name: rateName } });
    if (existing) {
      return db.shippingRate.update({ where: { id: existing.id }, data: { price: ratePrice } });
    }
    return db.shippingRate.create({ data: { name: rateName, price: ratePrice } });
  };

  const metro = await getOrCreateRate('Metropolitana Bucaramanga', 9000);
  const regional = await getOrCreateRate('Regional Nororiente', 12500);
  const nacional = await getOrCreateRate('Nacional', 19000);

  // 2. Fijar Nacional como default global
  await db.shippingConfig.upsert({
    where: { id: 'singleton' },
    update: { defaultRateId: nacional.id },
    create: { id: 'singleton', freeShippingThreshold: 200000, defaultRateId: nacional.id },
  });

  // 3. Asignar tarifas a municipios (filtrando por departamento para evitar homónimos)
  const asignar = async (rateId: string, departmentName: string, nombres: string[]) => {
    for (const n of nombres) {
      const normalizedName = normalizeString(n);
      const res = await db.municipality.updateMany({
        where: { 
          normalizedName, 
          department: { name: departmentName } 
        },
        data: { shippingRateId: rateId },
      });
      if (res.count === 0) console.warn(`⚠️ No encontrado (revisar): ${n} en ${departmentName}`);
    }
  };

  await asignar(metro.id, 'Santander', [
    'Bucaramanga', 'Girón', 'Piedecuesta', 'Floridablanca',
  ]);
  await asignar(regional.id, 'Santander', [
    'San Gil', 'Barrancabermeja', 'Sabana de Torres', 
  ]);
  await asignar(regional.id, 'Cesar', [
    'Valledupar',
  ]);
  await asignar(regional.id, 'Norte de Santander', [
    'Cúcuta',
  ]);

  console.log('✅ Tarifas y asignaciones listas.');
}

main().finally(() => db.$disconnect());
