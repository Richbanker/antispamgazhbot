import { userService } from '../services/userService';
import { config } from '../config';
import { differenceInDays } from 'date-fns';

export type UserRole = 'newbie' | 'verified' | 'vip';

export const roleService = {
  async getRole(userId: number): Promise<UserRole> {
    const user = await userService.getUser(userId);
    return user?.role || 'newbie';
  },
  async setRole(userId: number, role: UserRole) {
    await userService.setRole(userId, role);
  },
  async autoPromote(userId: number) {
    const user = await userService.getUser(userId);
    if (!user) return;
    const days = differenceInDays(new Date(), new Date(user.join_date));
    if (user.role === 'newbie' && days >= config.PROMOTE_AFTER_DAYS && user.messages_count >= config.PROMOTE_AFTER_MESSAGES) {
      await userService.setRole(userId, 'verified');
    }
  },
  async promote(userId: number, role: UserRole) {
    await userService.setRole(userId, role);
  },
  async demote(userId: number) {
    await userService.setRole(userId, 'newbie');
  },
  canBypassSpam(role: UserRole) {
    return role === 'vip';
  }
}; 