/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  title: string;
  location: string;
  subLocality: string;
  price: number;
  rentOrBuy: 'Rent' | 'Buy';
  sizeSqFt: number;
  bedrooms: number;
  bathrooms: number;
  facing: string;
  status: 'Approved' | 'Pending Approval' | 'Rented' | 'Sold' | 'Draft' | 'Rejected';
  amenities: string[];
  description: string;
  images: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
    avatar: string;
  };
  views: number;
  inquiries: number;
  featured?: boolean;
  tags?: string[];
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  date: string;
  status: 'Received' | 'Under Review' | 'Contacted' | 'Answered';
}

export interface SupportRequest {
  id: string;
  customerName: string;
  email: string;
  message: string;
  date: string;
  status: 'Open' | 'Resolved';
}

export interface DesignToken {
  name: string;
  value: string;
  usage: string;
}

export interface ChatMessage {
  id: string;
  propertyId: string;
  sender: 'customer' | 'builder';
  senderName: string;
  text: string;
  timestamp: number;
  attachment?: {
    name: string;
    type: 'image' | 'document';
    url: string;
  };
}

export interface ChatInvitation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerEmail: string;
  timestamp: number;
  active: boolean;
}

export interface TypingState {
  propertyId: string;
  role: 'customer' | 'builder';
  isTyping: boolean;
}
