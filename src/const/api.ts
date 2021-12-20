export const MAX_USERS_PER_REQUEST = 10;
export const MAX_GIFTS_PER_REQUEST = 10;
export const MAX_NOTIFICATIONS_PER_REQUEST = 10;

export enum giftStatus {
  'PENDING',
  'DELIVERED',
  'RECEIVED',
}

export enum notificationType {
  'GIFT_STATUS_CHANGED',
  'ALERT',
  'NEWS',
  'THANK_SANTA',
}

export enum userFaculty {
  'МФ КТИУ',
  'МФ ТИНТ',
  'ФТМФ',
  'МФ НЖ',
  'МФ БТИНС',
  'ФТМИИ',
}

export enum userRoles {
  'user',
  'elf',
  'admin',
}

export enum botEvents {
  'REGISTRATION',
  'RECEIVER_ATTACHED',
  'GIFT_DELIVERED',
  'MY_GIFT_DELIVERED',
  'GIFT_RECEIVED',
  'MY_GIFT_RECEIVED',
}
