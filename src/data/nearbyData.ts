/**
 * Local Infrastructural Hubs in Hyderabad Neighborhoods
 */

export interface NearbyHub {
  id: string;
  name: string;
  type: 'school' | 'hospital' | 'transit';
  distance: string;
  time: string;
  rating: number;
  x: number; // percentage width on interactive SVG map (10-90)
  y: number; // percentage height on interactive SVG map (10-90)
  details: string;
}

export const nearbyHubsByLocality: { [locality: string]: NearbyHub[] } = {
  'gachibowli': [
    {
      id: 'g-sch-1',
      name: 'Oakridge International School',
      type: 'school',
      distance: '1.4 km',
      time: '5 mins drive',
      rating: 4.8,
      x: 30,
      y: 25,
      details: 'Ranked top IB curriculum world-school in West Hyderabad'
    },
    {
      id: 'g-sch-2',
      name: 'Delhi Public School (DPS)',
      type: 'school',
      distance: '1.8 km',
      time: '7 mins drive',
      rating: 4.6,
      x: 75,
      y: 20,
      details: 'Premier CBSE co-educational institution with expansive sports arena'
    },
    {
      id: 'g-hsp-1',
      name: 'AIG Hospitals',
      type: 'hospital',
      distance: '0.9 km',
      time: '3 mins drive / 11 mins walk',
      rating: 4.9,
      x: 20,
      y: 65,
      details: 'State-of-the-art super specialty healthcare facility (800+ beds)'
    },
    {
      id: 'g-hsp-2',
      name: 'Continental Hospitals',
      type: 'hospital',
      distance: '1.5 km',
      time: '5 mins drive',
      rating: 4.7,
      x: 60,
      y: 75,
      details: 'JCI Accredited multi-specialty center for advanced clinical care'
    },
    {
      id: 'g-trn-1',
      name: 'Raidurg Metro Station (Blue Line)',
      type: 'transit',
      distance: '2.2 km',
      time: '8 mins drive',
      rating: 4.5,
      x: 45,
      y: 40,
      details: 'Major rapid transit hub connects directly to Secunderabad and core city'
    },
    {
      id: 'g-trn-2',
      name: 'Gachibowli ORR Junction Terminus',
      type: 'transit',
      distance: '0.8 km',
      time: '10 mins walk',
      rating: 4.4,
      x: 85,
      y: 55,
      details: 'Fast access to Nehru Outer Ring Road with direct airport express coaches'
    }
  ],
  'madhapur': [
    {
      id: 'm-sch-1',
      name: 'NIFT Hyderabad Campus',
      type: 'school',
      distance: '0.5 km',
      time: '6 mins walk',
      rating: 4.7,
      x: 40,
      y: 20,
      details: 'National Institute of Fashion Technology landmark campus node'
    },
    {
      id: 'm-sch-2',
      name: 'Manthan International School',
      type: 'school',
      distance: '1.2 km',
      time: '4 mins drive',
      rating: 4.7,
      x: 80,
      y: 35,
      details: 'Excellent Cambridge and CBSE combined system learning hub'
    },
    {
      id: 'm-hsp-1',
      name: 'Medicover Hospitals',
      type: 'hospital',
      distance: '0.6 km',
      time: '8 mins walk',
      rating: 4.8,
      x: 15,
      y: 55,
      details: 'Renowned critical care and trauma center with 24/7 cardiac ICU'
    },
    {
      id: 'm-hsp-2',
      name: 'Hegde IVF & General Hospital',
      type: 'hospital',
      distance: '1.1 km',
      time: '3 mins drive',
      rating: 4.4,
      x: 65,
      y: 80,
      details: 'Leading family care, pediatrics, and emergency wellness outpost'
    },
    {
      id: 'm-trn-1',
      name: 'Madhapur Metro Station',
      type: 'transit',
      distance: '0.4 km',
      time: '5 mins walk',
      rating: 4.6,
      x: 50,
      y: 50,
      details: 'High-frequency elevated line terminal centering Hitech street grids'
    },
    {
      id: 'm-trn-2',
      name: 'Hitech City Metro Station',
      type: 'transit',
      distance: '1.2 km',
      time: '4 mins drive',
      rating: 4.7,
      x: 90,
      y: 65,
      details: 'Primary transit junction linking Cyber Towers and Gachibowli IT corridors'
    }
  ],
  'financial district': [
    {
      id: 'fd-sch-1',
      name: 'The Keystone School',
      type: 'school',
      distance: '0.8 km',
      time: '10 mins walk',
      rating: 4.6,
      x: 25,
      y: 30,
      details: 'Activity-driven progressive smart school structure'
    },
    {
      id: 'fd-sch-2',
      name: 'ISB Capital Campus (Gachibowli)',
      type: 'school',
      distance: '1.6 km',
      time: '6 mins drive',
      rating: 4.9,
      x: 75,
      y: 15,
      details: 'India\'s top-ranked business school academic park'
    },
    {
      id: 'fd-hsp-1',
      name: 'Continental Healthcare District',
      type: 'hospital',
      distance: '0.5 km',
      time: '6 mins walk',
      rating: 4.8,
      x: 35,
      y: 70,
      details: 'JCI-accredited clinical facility hosting international specialists'
    },
    {
      id: 'fd-trn-1',
      name: 'Wipro Circle Transit Station',
      type: 'transit',
      distance: '0.3 km',
      time: '4 mins walk',
      rating: 4.4,
      x: 55,
      y: 45,
      details: 'Busiest tech-commuter node with rapid high-comfort shuttle networks'
    },
    {
      id: 'fd-trn-2',
      name: 'Outer Ring Road Exit 3 (Nanakramguda)',
      type: 'transit',
      distance: '0.7 km',
      time: '8 mins walk',
      rating: 4.7,
      x: 82,
      y: 60,
      details: 'Direct signal-free link to Shamshabad Airport (RGI) in 25 mins'
    }
  ],
  'jubilee hills': [
    {
      id: 'jh-sch-1',
      name: 'Jubilee Hills Public School',
      type: 'school',
      distance: '1.0 km',
      time: '4 mins drive',
      rating: 4.7,
      x: 30,
      y: 18,
      details: 'Highly acclaimed institution prioritizing academic merit and robotics'
    },
    {
      id: 'jh-sch-2',
      name: 'Bharatiya Vidya Bhavan',
      type: 'school',
      distance: '1.5 km',
      time: '6 mins drive',
      rating: 4.5,
      x: 70,
      y: 22,
      details: 'Heritage educational center on prime scenic hill setting'
    },
    {
      id: 'jh-hsp-1',
      name: 'Apollo Health City Landmark',
      type: 'hospital',
      distance: '0.8 km',
      time: '11 mins walk / 2 mins drive',
      rating: 4.9,
      x: 20,
      y: 60,
      details: 'Massive clinical campus encompassing specialty research and absolute care'
    },
    {
      id: 'jh-hsp-2',
      name: 'LV Prasad Eye Institute',
      type: 'hospital',
      distance: '1.4 km',
      time: '5 mins drive',
      rating: 4.8,
      x: 60,
      y: 80,
      details: 'Global center of excellence for advanced ophthalmology treatment'
    },
    {
      id: 'jh-trn-1',
      name: 'Jubilee Hills Check Post Metro',
      type: 'transit',
      distance: '0.5 km',
      time: '6 mins walk',
      rating: 4.6,
      x: 50,
      y: 45,
      details: 'Major elevated blue line station over Hyderabad\'s central commercial square'
    },
    {
      id: 'jh-trn-2',
      name: 'Peddamma Temple Metro Station',
      type: 'transit',
      distance: '0.9 km',
      time: '12 mins walk',
      rating: 4.5,
      x: 85,
      y: 50,
      details: 'Quiet access station bordering premium residential alleys and high streets'
    }
  ],
  'kondapur': [
    {
      id: 'k-sch-1',
      name: 'CHIREC International School',
      type: 'school',
      distance: '0.6 km',
      time: '8 mins walk',
      rating: 4.8,
      x: 25,
      y: 20,
      details: 'Premium multi-curriculum school with extensive academic pedigree'
    },
    {
      id: 'k-sch-2',
      name: 'Arbor International School',
      type: 'school',
      distance: '1.3 km',
      time: '5 mins drive',
      rating: 4.5,
      x: 75,
      y: 28,
      details: 'Active modern learning lab with creative science/performance hubs'
    },
    {
      id: 'k-hsp-1',
      name: 'KIMS Kondapur Hospital',
      type: 'hospital',
      distance: '0.9 km',
      time: '11 mins walk',
      rating: 4.7,
      x: 35,
      y: 72,
      details: 'Premier pediatric and surgical specialty hospital serving IT communities'
    },
    {
      id: 'k-trn-1',
      name: 'Kondapur Main Bus Depot',
      type: 'transit',
      distance: '0.5 km',
      time: '6 mins walk',
      rating: 4.3,
      x: 55,
      y: 52,
      details: 'Highly active localized network center connecting to Hitech and Miyapur'
    },
    {
      id: 'k-trn-2',
      name: 'Hafeezpet MMTS Railway Station',
      type: 'transit',
      distance: '1.9 km',
      time: '7 mins drive',
      rating: 4.1,
      x: 90,
      y: 48,
      details: 'Suburban train terminal providing fast direct access to Secunderabad and Nampally'
    }
  ],
  'banjara hills': [
    {
      id: 'bh-sch-1',
      name: 'Meridian School Road 7',
      type: 'school',
      distance: '0.7 km',
      time: '9 mins walk',
      rating: 4.6,
      x: 35,
      y: 25,
      details: 'Elite co-educational school with extensive focus on arts and science modules'
    },
    {
      id: 'bh-sch-2',
      name: 'Gitanjali Devshala High School',
      type: 'school',
      distance: '1.2 km',
      time: '5 mins drive',
      rating: 4.7,
      x: 80,
      y: 15,
      details: 'Renowned high-performing CBSE educational center of repute'
    },
    {
      id: 'bh-hsp-1',
      name: 'Care Hospitals Banjara Block',
      type: 'hospital',
      distance: '0.5 km',
      time: '6 mins walk',
      rating: 4.8,
      x: 20,
      y: 65,
      details: 'Multi-specialty cardiac and neuroscience hub of extreme excellence'
    },
    {
      id: 'bh-hsp-2',
      name: 'Rainbow Childrens Super Specialty Hospital',
      type: 'hospital',
      distance: '1.0 km',
      time: '3 mins drive',
      rating: 4.7,
      x: 65,
      y: 75,
      details: 'India\'s leading specialized baby, pediatric, and maternity care center'
    },
    {
      id: 'bh-trn-1',
      name: 'Irrum Manzil Metro Station',
      type: 'transit',
      distance: '1.1 km',
      time: '4 mins drive',
      rating: 4.6,
      x: 50,
      y: 45,
      details: 'Direct transfer point to central city markets, shopping complexes, and rail links'
    },
    {
      id: 'bh-trn-2',
      name: 'Road No 1 Banjara Hills Bus Port',
      type: 'transit',
      distance: '0.3 km',
      time: '4 mins walk',
      rating: 4.4,
      x: 88,
      y: 60,
      details: 'Bus connectivity grid spanning core Hyderabad and highway segments'
    }
  ]
};

/**
 * Fallback generator for other locations
 */
export function getNearbyHubsForLocation(locationStr: string, subLocality: string): NearbyHub[] {
  const normKey = (subLocality || locationStr || 'gachibowli').toLowerCase().trim();
  
  if (normKey.includes('gachibowli')) return nearbyHubsByLocality['gachibowli'];
  if (normKey.includes('madhapur')) return nearbyHubsByLocality['madhapur'];
  if (normKey.includes('financial') || normKey.includes('nanakramguda')) return nearbyHubsByLocality['financial district'];
  if (normKey.includes('jubilee')) return nearbyHubsByLocality['jubilee hills'];
  if (normKey.includes('kondapur')) return nearbyHubsByLocality['kondapur'];
  if (normKey.includes('banjara')) return nearbyHubsByLocality['banjara hills'];
  
  // Return Gachibowli as super standard fallback, dynamically mapping title so everything stays fully consistent
  return nearbyHubsByLocality['gachibowli'];
}
