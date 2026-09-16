export interface TrainConfig {
  id: string;
  line: string;
  lineColor: string;
  model: string;
  carNumber: string;
  accentColor: number;
  accentColorCSS: string;
  stripeColor: number;
  cars: number;
  description: string;
}

export const TRAIN_CONFIGS: TrainConfig[] = [
  {
    id: 'r151',
    line: 'North-South & East-West',
    lineColor: '#DC2626',
    model: 'Alstom Movia R151',
    carNumber: '#3041',
    accentColor: 0xdc2626,
    accentColorCSS: '#DC2626',
    stripeColor: 0xdc2626,
    cars: 6,
    description: 'Singapore\'s newest NSEWL train with iconic red stripe',
  },
  {
    id: 'c151a',
    line: 'North-South & East-West',
    lineColor: '#DC2626',
    model: 'Kawasaki C151A',
    carNumber: '#3501',
    accentColor: 0x16a34a,
    accentColorCSS: '#16A34A',
    stripeColor: 0x16a34a,
    cars: 6,
    description: 'Refurbished NSEWL fleet with green accent',
  },
  {
    id: 't251',
    line: 'Thomson-East Coast',
    lineColor: '#A16207',
    model: 'T251',
    carNumber: '#5001',
    accentColor: 0xa16207,
    accentColorCSS: '#A16207',
    stripeColor: 0xa16207,
    cars: 4,
    description: '4-car, 5-door configuration for TEL',
  },
  {
    id: 'c830c',
    line: 'Circle Line',
    lineColor: '#F59E0B',
    model: 'Alstom C830C',
    carNumber: '#8301',
    accentColor: 0xf59e0b,
    accentColorCSS: '#F59E0B',
    stripeColor: 0xf59e0b,
    cars: 3,
    description: '3-car set for Circle Line',
  },
  {
    id: 'c951',
    line: 'Downtown Line',
    lineColor: '#2563EB',
    model: 'Bombardier C951',
    carNumber: '#9501',
    accentColor: 0x2563eb,
    accentColorCSS: '#2563EB',
    stripeColor: 0x2563eb,
    cars: 3,
    description: 'Downtown Line driverless train',
  },
];
