export type Plant = {
  id: string;
  nickname: string;
  species: string;
  wateringInterval: number;
  lastWateredAt: number;
  streak: number;
  createdAt: number;
  userId: string;
  notificationId?: string;
};
