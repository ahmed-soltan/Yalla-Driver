export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'SCOOTER' | 'BICYCLE';

export type VehicleField = 'make' | 'model' | 'year' | 'color' | 'plateNumber';

export const vehicleTypeFields: Record<VehicleType, VehicleField[]> = {
  CAR: ['make', 'model', 'year', 'color', 'plateNumber'],
  MOTORCYCLE: ['make', 'model', 'year', 'color', 'plateNumber'],
  SCOOTER: ['make', 'model', 'year', 'color'],
  BICYCLE: [],
};

export const vehicleFieldLabels: Record<VehicleField, string> = {
  make: 'الماركة',
  model: 'الموديل',
  year: 'سنة الصنع',
  color: 'لون المركبة',
  plateNumber: 'رقم اللوحة',
};
