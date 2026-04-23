export type Room = {
  _id: string;
  roomName: string;
  roomNumber: number;
  buildingNumber: number;
  capacity: number;
  floor?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type RoomSortOption =
  | "-createdAt"
  | "createdAt"
  | "roomName"
  | "-roomName"
  | "buildingNumber"
  | "-buildingNumber";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type RoomListPayload = {
  meta: PaginationMeta;
  result: Room[];
};

export type RoomListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: RoomSortOption;
  isActive?: string;
  buildingNumber?: string;
  fields?: string;
};

export type RoomInput = {
  roomName: string;
  roomNumber: number;
  buildingNumber: number;
  capacity: number;
  floor?: number;
  isActive?: boolean;
};

export type RoomUpdateInput = Partial<RoomInput>;

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
