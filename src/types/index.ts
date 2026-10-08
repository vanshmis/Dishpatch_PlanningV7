export type PIStatus = 'PENDING' | 'APPROVED' | 'PLANNED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | 'HOLD' | 'DRAFT';
export type DispatchStatus = 'DRAFT' | 'READY_FOR_LOADING' | 'LOADING' | 'GATE_PASS_ISSUED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type PriorityLevel = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export interface PIItem {
  id: string;
  itemCode: string;
  description: string;
  quantity: number;
  originalQuantity?: number;
  unit: string;
  weightKg: number;
  volumeCbm: number;
  rate: number;
  amount: number;
}

export interface ProformaInvoice {
  id: string;
  piNumber: string;
  orderNumber: string;
  clientName: string;
  clientCode: string;
  destinationCity: string;
  state: string;
  deliveryAddress: string;
  pinCode: string;
  piDate: string;
  expectedDeliveryDate: string;
  items: PIItem[];
  totalWeightKg: number;
  totalVolumeCbm: number;
  totalAmount: number;
  status: PIStatus;
  priority: PriorityLevel;
  assignedDispatchId?: string;
  remarks?: string;
  createdDate: string;
  latitude?: string;
  longitude?: string;
  distanceKm?: number;
  division?: 'GT' | 'MT' | 'SMT' | 'SMT-Direct';
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  capacityTons: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  type: string; // '14ft Eicher' | '19ft Container' | '32ft MXL' | 'Tata Ace' | 'Trailer'
  capacityWeightKg: number;
  capacityVolumeCbm: number;
  ownerType: 'OWN' | 'MARKET' | 'CONTRACT';
  transporterName?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'IN_TRANSIT';
  driverName?: string;
  driverPhone?: string;
  rcExpiryDate: string;
  insuranceExpiryDate: string;
  fitnessExpiryDate: string;
  currentLocation?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY';
  experienceYears: number;
  rating: number;
}

export interface DispatchPlan {
  id: string;
  dispatchNumber: string;
  planningDate: string;
  dispatchDate: string;
  scheduledTimeSlot: string;
  status: DispatchStatus;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: string;
  driverId?: string;
  driverName: string;
  driverPhone: string;
  transporterName?: string;
  route: string[];
  piIds: string[];
  pis?: ProformaInvoice[];
  totalWeightKg: number;
  maxWeightCapacityKg: number;
  totalVolumeCbm: number;
  maxVolumeCapacityCbm: number;
  estimatedFreightCost: number;
  gatePassNumber?: string;
  gatePassIssuedAt?: string;
  lrNumber?: string;
  sealNumber?: string;
  remarks?: string;
  startedAt?: string;
  completedAt?: string;
  deliveryProofUrl?: string;
  receivedBy?: string;
  receivedDate?: string;
  isRollbackAllowed: boolean;
  latitude?: string;
  longitude?: string;
  totalDistanceKm?: number;
  warehouseId?: string;
  warehouseName?: string;
}

export interface RollbackAction {
  id: string;
  dispatchId: string;
  dispatchNumber: string;
  reasonCategory: 'VEHICLE_BREAKDOWN' | 'CLIENT_CANCELLATION' | 'WEIGHT_DISCREPANCY' | 'INCORRECT_MAPPING' | 'DOCUMENTATION_ERROR' | 'OTHER';
  reasonNotes: string;
  actionTaken: 'REVERT_TO_PENDING' | 'CANCEL_DISPATCH' | 'REASSIGN_VEHICLE' | 'GATE_PASS_CANCEL';
  requestedBy: string;
  requestedAt: string;
  approvedBy: string;
  status: 'COMPLETED' | 'REJECTED';
  affectedPiCount: number;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  deliveryZone: string;
  latitude?: string;
  longitude?: string;
  distanceKm?: number;
  activePISummary?: {
    pendingCount: number;
    inTransitCount: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface POPickup {
  id: string;
  uniqueId: string;
  poNumber: string;
  poDated: string;
  vendorType: string;
  contactPersonName: string;
  vendorCode: string;
  vendorName: string;
  contactPersonNo: string;
  vendorAddress: string;
  paymentTerm: string;
  deliveryDate: string;
  pdfUrl?: string;
  actualFillPurchaseTeam: string;
  planned?: string;
  actual?: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface SpecialRequest {
  id: string;
  requestId: string;
  vendorName: string;
  location: string;
  latitude?: string;
  longitude?: string;
  contactNumber: string;
  itemName: string;
  deadlineDate: string;
  feedback?: string;
  attachments: string[];
  submittedAt: string;
  status: 'PENDING' | 'WORK_DONE';
  workDoneAt?: string;
}

export interface KBOrder {
  id: string;
  timestamp: string;
  piNo: string;
  partyName: string;
  orderNo: string;
  itemName: string;
  qty: number;
  amount: number;
  billingAddress: string;
  supplyNameAddress: string;
  challanNo?: string;
  status: 'PENDING' | 'COMPLETED';
}

