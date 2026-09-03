
export function groupRoomsByBuilding(buildings, rooms) {
  const buildingMap = new Map();

  // สร้างอาคารทั้งหมดไว้ก่อน แม้จะยังไม่มีห้อง (rooms_count: 0 ก็ต้องแสดง)
  buildings.forEach((b) => {
    buildingMap.set(b.name, {
      id: b.id,
      name: b.name,
      totalFloors: b.floors ?? null,
      floors: new Map(),
    });
  });

  rooms.forEach((room) => {
    const buildingKey = room.building_name?.trim() || 'ไม่ระบุอาคาร';

    if (!buildingMap.has(buildingKey)) {
      // เจอห้องที่ชื่ออาคารไม่ตรงกับ collection buildings เลย (ข้อมูลไม่ sync กัน)
      // ยังคงแสดงไว้ ไม่ให้ข้อมูลหาย แต่ควรไปเช็คความถูกต้องของข้อมูลต้นทาง
      buildingMap.set(buildingKey, {
        id: buildingKey,
        name: buildingKey,
        totalFloors: null,
        floors: new Map(),
      });
    }

    const building = buildingMap.get(buildingKey);
    const floorKey = room.floor ?? 0;

    if (!building.floors.has(floorKey)) {
      building.floors.set(floorKey, []);
    }
    building.floors.get(floorKey).push(room);
  });

  return Array.from(buildingMap.values())
    .map((building) => ({
      ...building,
      floors: Array.from(building.floors.entries())
        .sort((a, z) => a[0] - z[0])
        .map(([floorNumber, roomsInFloor]) => ({
          floorNumber,
          rooms: roomsInFloor
            .slice()
            .sort((a, z) => String(a.id).localeCompare(String(z.id))),
        })),
    }))
    .sort((a, z) => a.name.localeCompare(z.name, 'th'));
}