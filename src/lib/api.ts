import { Case, Donation, UserProfile } from '../types';

const API_BASE = '/api';

export const api = {
  async getProfile(uid: string, name: string, email: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, name, email }),
    });
    return res.json();
  },

  async getCases(): Promise<Case[]> {
    const res = await fetch(`${API_BASE}/cases`);
    return res.json();
  },

  async createCase(caseData: Partial<Case>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData),
    });
    return res.json();
  },

  async updateCase(id: string, updates: { status?: string; evidence?: any[] }): Promise<void> {
    await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async getDonations(): Promise<Donation[]> {
    const res = await fetch(`${API_BASE}/donations`);
    return res.json();
  },

  async createDonation(donation: Partial<Donation>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation),
    });
    return res.json();
  },

  async confirmDonation(id: string): Promise<void> {
    await fetch(`${API_BASE}/donations/${id}/confirm`, { method: 'POST' });
  },

  async rejectDonation(id: string): Promise<void> {
    await fetch(`${API_BASE}/donations/${id}/reject`, { method: 'POST' });
  },

  async getLeaderboard(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return res.json();
  }
};
