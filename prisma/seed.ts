/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Seeds demo users + starter data. Safe to re-run (upserts on fixed ids).
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'ourhome123';

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: 'customer@ourhome.com' },
    update: {},
    create: {
      id: 'user-customer-1',
      email: 'customer@ourhome.com',
      name: 'Premium Client',
      role: 'customer',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'builder@ourhome.com' },
    update: {},
    create: {
      id: 'user-builder-1',
      email: 'builder@ourhome.com',
      name: 'Arjun Nandan',
      role: 'builder',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@ourhome.com' },
    update: {},
    create: {
      id: 'user-admin-1',
      email: 'admin@ourhome.com',
      name: 'System Administrator',
      role: 'admin',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80',
    },
  });

  const properties = [
    {
      id: 'prop-1',
      title: 'Skyline Oasis 3BHK Penthouse',
      location: 'Skyline Towers, Sector 1, Gachibowli, Hyderabad',
      subLocality: 'Gachibowli',
      price: 24000000,
      rentOrBuy: 'Buy' as const,
      sizeSqFt: 3200,
      bedrooms: 3,
      bathrooms: 4,
      facing: 'East',
      status: 'Approved',
      featured: true,
      tags: ['Luxury', 'Family-Friendly'],
      views: 1240,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        'Swimming Pool', 'Private Gym', 'Clubhouse', 'Rooftop Deck', '24/7 Security',
        'Smart Home Automation', 'Private Elevator', 'Concierge Service',
      ],
      description: 'Experience unparalleled luxury in this masterfully designed penthouse at Skyline Towers. Perched high above Gachibowli, this East-facing architectural masterwork offers breathtaking panoramic vistas of the Hyderabad IT corridor skyline.\n\nFeaturing sprawling open-concept living salons, custom imported Italian marble floors, a chef-caliber gourmet kitchen equipped with elite smart appliances, and dual master suites. Extend your living space outdoors onto a magnificent private landscaped rooftop terrace, complete with a deck and sky-side hot tub pool, perfect for absolute relaxation or hosting exclusive events.',
      agentName: 'Arjun Nandan',
      agentPhone: '+91 98765 43210',
      agentEmail: 'arjun@ourhome.com',
      agentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'prop-2',
      title: 'The Signature Estate Villa',
      location: 'Road No. 12, Jubilee Hills, Hyderabad',
      subLocality: 'Jubilee Hills',
      price: 58000000,
      rentOrBuy: 'Buy' as const,
      sizeSqFt: 4800,
      bedrooms: 4,
      bathrooms: 5,
      facing: 'North-East',
      status: 'Approved',
      featured: true,
      tags: ['Luxury', 'Family-Friendly'],
      views: 940,
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        'Private Lawn', 'Swimming Pool', 'Home Theatre', 'Smart Automation',
        'Italian Marble', 'Multi-car Garage', 'Servant Quarters',
      ],
      description: 'A masterpiece of contemporary luxury nested in Hyderabad’s most prestigious neighborhood—Jubilee Hills. This gorgeous architectural statement stands out with premium travertine cladding, massive double-glazed high ceilings, custom ambient light schemes, and an exquisite landscape garden framing a private temperature-controlled swimming pool.',
      agentName: 'Suhasini Mehta',
      agentPhone: '+91 99887 76655',
      agentEmail: 'suhasini@ourhome.com',
      agentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'prop-3',
      title: 'Lakeside Horizon Smart Condo',
      location: 'Hitec City Road, Madhapur, Hyderabad',
      subLocality: 'Madhapur',
      price: 65000,
      rentOrBuy: 'Rent' as const,
      sizeSqFt: 1450,
      bedrooms: 2,
      bathrooms: 2,
      facing: 'West',
      status: 'Approved',
      featured: false,
      tags: ['Budget'],
      views: 450,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        'Gated Security', 'Childrens Play Area', 'Full Power Backup',
        'Equipped Gym', 'EV Charging Station', 'Jogging Track',
      ],
      description: 'A modern, eco-friendly smart home optimized for young IT professionals. Situated directly on Hitec City Road with stunning views overlooking Durgam Cheruvu Lake. Features automated touch-sensitive controls for light, air-conditioning, water systems, high-speed fiber connection, and an in-house pantry laundry closet.',
      agentName: 'Rohan Sharma',
      agentPhone: '+91 91234 56789',
      agentEmail: 'rohan@ourhome.com',
      agentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'prop-4',
      title: 'Ascent Heights Sky Residence',
      location: 'Financial District, Nanakramguda, Hyderabad',
      subLocality: 'Financial District',
      price: 110000,
      rentOrBuy: 'Rent' as const,
      sizeSqFt: 2100,
      bedrooms: 3,
      bathrooms: 3,
      facing: 'North',
      status: 'Approved',
      featured: true,
      tags: ['Luxury'],
      views: 780,
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        'Squash Court', 'Kids Infinity Pool', 'Co-working Lounge',
        'Sky Lounge Deck', 'Tennis Court', 'Steam & Sauna Room',
      ],
      description: 'Elevate your living standards inside Hyderabad’s banking hub. Nestled on a very high floor of Ascent Heights, this luxury flat offers floor-to-ceiling glass paneling and premium modular furnishings. Seamless and lightning-fast connectivity to offices in Nanakramguda and outer ring road access makes this an ideal executive dwelling.',
      agentName: 'Arjun Nandan',
      agentPhone: '+91 98765 43210',
      agentEmail: 'arjun@ourhome.com',
      agentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'prop-5',
      title: 'Oakwood Crest Modern Flat',
      location: 'Raghavendra Colony, Kondapur, Hyderabad',
      subLocality: 'Kondapur',
      price: 16500000,
      rentOrBuy: 'Buy' as const,
      sizeSqFt: 1980,
      bedrooms: 3,
      bathrooms: 3,
      facing: 'East',
      status: 'Approved',
      featured: false,
      tags: ['Budget', 'Family-Friendly'],
      views: 520,
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        'Tennis Court', 'Intercom Unit', 'Supermarket inside complex',
        'Covered Parking Slot', 'STP Water Recycler',
      ],
      description: 'A great value-for-money modern family residence located central to Kondapur’s vibrant social district, adjacent to Botanical Gardens. Perfectly ventilated with double balconies, dedicated utility storage, and high-quality Vitrified flooring with modular wardrobes pre-installed.',
      agentName: 'Rohan Sharma',
      agentPhone: '+91 91234 56789',
      agentEmail: 'rohan@ourhome.com',
      agentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    },
    {
      id: 'prop-6',
      title: 'Hillview Regency Grand Flat',
      location: 'Road No. 3, Banjara Hills, Hyderabad',
      subLocality: 'Banjara Hills',
      price: 31000000,
      rentOrBuy: 'Buy' as const,
      sizeSqFt: 2600,
      bedrooms: 3,
      bathrooms: 4,
      facing: 'South',
      status: 'Pending Approval',
      featured: false,
      tags: ['Luxury', 'Family-Friendly'],
      views: 290,
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672085614-53907c646b9a?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        'Servant Room', 'Modern High-speed Lift', 'Whisper Silent Generator',
        '24/7 CCTV Surveillance', 'Piped Gas Lines',
      ],
      description: 'Sophisticated living in the historic premium high street of Hyderabad. Hillview Regency is located right next to high-end boutiques and upscale diners. Features high privacy design with only two grand flats per floor, generous kitchen spaces, separated maids quarters, and wooden master suite floors.',
      agentName: 'Suhasini Mehta',
      agentPhone: '+91 99887 76655',
      agentEmail: 'suhasini@ourhome.com',
      agentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80',
    },
  ];

  for (const property of properties) {
    await prisma.property.upsert({
      where: { id: property.id },
      update: {},
      create: property,
    });
  }

  const appointments = [
    {
      id: 'appt-1',
      propertyId: 'prop-1',
      propertyTitle: 'Skyline Oasis 3BHK Penthouse',
      customerName: 'Anil Kumar',
      customerEmail: 'anil@gmail.com',
      customerPhone: '+91 94401 23456',
      date: '2026-06-20',
      timeSlot: '11:00 AM - 12:30 PM',
      status: 'Scheduled',
    },
    {
      id: 'appt-2',
      propertyId: 'prop-3',
      propertyTitle: 'Lakeside Horizon Smart Condo',
      customerName: 'Priya Joshi',
      customerEmail: 'priya.j@outlook.com',
      customerPhone: '+91 95502 98765',
      date: '2026-06-22',
      timeSlot: '04:00 PM - 05:30 PM',
      status: 'Confirmed',
    },
  ];

  for (const appointment of appointments) {
    await prisma.appointment.upsert({
      where: { id: appointment.id },
      update: {},
      create: appointment,
    });
  }

  const inquiries = [
    {
      id: 'inq-1',
      propertyId: 'prop-1',
      propertyTitle: 'Skyline Oasis 3BHK Penthouse',
      customerName: 'Premium Client',
      customerEmail: 'elite.client@hyderabad.in',
      customerPhone: '+91 91000 12345',
      message: 'Greetings! I am looking for a premium north-facing 3BHK. Is there custom interior modification support for the terrace pool?',
      date: '2026-06-19',
      status: 'Received',
    },
    {
      id: 'inq-2',
      propertyId: 'prop-3',
      propertyTitle: 'Miyapur Greenwoods 3BHK',
      customerName: 'Premium Client',
      customerEmail: 'elite.client@hyderabad.in',
      customerPhone: '+91 91000 12345',
      message: 'Is the possession date guaranteed by Dec 2026? I am interested in a banking loan tie-up option with SBI.',
      date: '2026-06-18',
      status: 'Under Review',
    },
    {
      id: 'inq-3',
      propertyId: 'prop-4',
      propertyTitle: 'Lakeside Horizon Smart Condo',
      customerName: 'Premium Client',
      customerEmail: 'elite.client@hyderabad.in',
      customerPhone: '+91 91000 12345',
      message: 'I would like to schedule a virtual walkthrough this Sunday. Please advise if high-speed fiber internet is pre-terminated.',
      date: '2026-06-17',
      status: 'Contacted',
    },
    {
      id: 'inq-4',
      propertyId: 'prop-2',
      propertyTitle: 'Jubilee Hills Manor of Kings',
      customerName: 'Vikram Reddy',
      customerEmail: 'vikram.reddy@techm.com',
      customerPhone: '+91 98850 11223',
      message: 'Hello, is there any scope for price negotiation? I would like to pay 50% upfront downpayment and complete the rest in 30 days.',
      date: '2026-06-15',
      status: 'Answered',
    },
  ];

  for (const inquiry of inquiries) {
    await prisma.inquiry.upsert({
      where: { id: inquiry.id },
      update: {},
      create: inquiry,
    });
  }

  await prisma.supportRequest.upsert({
    where: { id: 'sup-1' },
    update: {},
    create: {
      id: 'sup-1',
      customerName: 'Naresh Goud',
      email: 'naresh@goudbuilders.in',
      message: 'I am a builder and registered for a new seller account. How can I get my property "Hillview Regency" verified quickly? Our license reference is HYD-RERA-2026-991.',
      date: '2026-06-16',
      status: 'Open',
    },
  });

  await prisma.chatMessage.upsert({
    where: { id: 'm1' },
    update: {},
    create: {
      id: 'm1',
      propertyId: 'prop-1',
      sender: 'builder',
      senderName: 'Arjun Nandan',
      text: 'Hello! Welcome to the premium listing of Gachibowli Sky Penthouse. How may I assist your custom queries today?',
      timestamp: BigInt(Date.now() - 36500000),
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
