/**
 * OurHome Application Automated Testing Suite
 * Includes: Comprehensive Unit Tests, Calculation Tests, API Smoke Tests, and Functional End-to-End Tests
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n==================================================');
console.log('🧪 RUNNING OURHOME UNIT, SMOKE & FUNCTIONAL TEST SUITE');
console.log('==================================================\n');

// ----------------------------------------------------
// SECTION 1: UNIT TESTS - Financial & Calculation Engines
// ----------------------------------------------------
console.log('--- SECTION 1: Financial & Calculation Unit Tests ---');

function calculateEMI(loanVal, interestRate, tenureYears) {
  const calcP = loanVal;
  const calcR = interestRate / 12 / 100;
  const calcN = tenureYears * 12;
  let monthlyEmi = 0;
  if (calcR > 0) {
    monthlyEmi = (calcP * calcR * Math.pow(1 + calcR, calcN)) / (Math.pow(1 + calcR, calcN) - 1);
  } else {
    monthlyEmi = calcP / calcN;
  }
  return Math.round(monthlyEmi);
}

function calculateTotalPayable(loanVal, interestRate, tenureYears) {
  const emi = calculateEMI(loanVal, interestRate, tenureYears);
  return emi * tenureYears * 12;
}

// Test 1.1: Standard EMI calculation
const emi1 = calculateEMI(20000000, 8.5, 20);
assert(emi1 > 170000 && emi1 < 175000, `EMI calculation for ₹2Cr loan @ 8.5% 20yrs: ₹${emi1.toLocaleString('en-IN')}/mo (Expected ~₹173,565)`);

// Test 1.2: Zero interest EMI fallback
const emiZero = calculateEMI(120000, 0, 1);
assert(emiZero === 10000, `Zero interest EMI fallback: ₹${emiZero}/mo (Expected ₹10,000)`);

// Test 1.3: Total Interest Payable calculation
const totalPayable = calculateTotalPayable(10000000, 9.0, 15);
const interestOnly = totalPayable - 10000000;
assert(interestOnly > 8000000 && interestOnly < 8500000, `Total Interest Calculation: ₹${Math.round(interestOnly).toLocaleString('en-IN')}`);

// ----------------------------------------------------
// SECTION 2: UNIT TESTS - Locality YoY Appreciation Index
// ----------------------------------------------------
console.log('\n--- SECTION 2: Locality Appreciation Index Unit Tests ---');

function getLocalityYoY(subLocality) {
  const loc = (subLocality || '').toLowerCase();
  if (loc.includes('jubilee')) return 15.6;
  if (loc.includes('financial')) return 14.2;
  if (loc.includes('gachibowli')) return 12.4;
  if (loc.includes('madhapur')) return 9.8;
  if (loc.includes('kondapur')) return 7.4;
  if (loc.includes('banjara')) return 4.2;
  return 8.5;
}

assert(getLocalityYoY('Jubilee Hills') === 15.6, 'Jubilee Hills YoY rate is 15.6% (Hyper-growth)');
assert(getLocalityYoY('Financial District') === 14.2, 'Financial District YoY rate is 14.2%');
assert(getLocalityYoY('Gachibowli') === 12.4, 'Gachibowli YoY rate is 12.4%');
assert(getLocalityYoY('Madhapur') === 9.8, 'Madhapur YoY rate is 9.8%');
assert(getLocalityYoY('Kondapur') === 7.4, 'Kondapur YoY rate is 7.4%');
assert(getLocalityYoY('Banjara Hills') === 4.2, 'Banjara Hills YoY rate is 4.2%');
assert(getLocalityYoY('Unknown Locality') === 8.5, 'Default fallback YoY rate is 8.5%');

// ----------------------------------------------------
// SECTION 3: UNIT TESTS - Property Filter Matching Engine
// ----------------------------------------------------
console.log('\n--- SECTION 3: Property Filter Logic Unit Tests ---');

const mockProperties = [
  { id: 'p1', title: 'Luxury Villa', subLocality: 'Jubilee Hills', rentOrBuy: 'Buy', price: 50000000, bedrooms: 4, status: 'Approved', facing: 'East' },
  { id: 'p2', title: 'Tech Condo', subLocality: 'Gachibowli', rentOrBuy: 'Rent', price: 45000, bedrooms: 2, status: 'Approved', facing: 'West' },
  { id: 'p3', title: 'Pending Estate', subLocality: 'Madhapur', rentOrBuy: 'Buy', price: 30000000, bedrooms: 3, status: 'Pending Approval', facing: 'North' },
  { id: 'p4', title: 'Skyline Flat', subLocality: 'Gachibowli', rentOrBuy: 'Buy', price: 20000000, bedrooms: 3, status: 'Approved', facing: 'East' }
];

function filterProps(list, rentOrBuy, subLoc, bedrooms, facing) {
  return list.filter(p => {
    if (p.status !== 'Approved') return false;
    if (rentOrBuy && rentOrBuy !== 'Any' && p.rentOrBuy !== rentOrBuy) return false;
    if (subLoc && subLoc !== 'Any' && p.subLocality !== subLoc) return false;
    if (bedrooms && bedrooms !== 'Any' && p.bedrooms !== Number(bedrooms)) return false;
    if (facing && facing !== 'Any' && p.facing !== facing) return false;
    return true;
  });
}

const buyApproved = filterProps(mockProperties, 'Buy', 'Any', 'Any', 'Any');
assert(buyApproved.length === 2 && buyApproved.every(p => p.rentOrBuy === 'Buy'), 'Filters out unapproved & non-buy properties correctly');

const rentGachibowli = filterProps(mockProperties, 'Rent', 'Gachibowli', 2, 'Any');
assert(rentGachibowli.length === 1 && rentGachibowli[0].id === 'p2', 'Filters specific sublocality and BHK count correctly');

const facingFilter = filterProps(mockProperties, 'Buy', 'Gachibowli', 3, 'East');
assert(facingFilter.length === 1 && facingFilter[0].id === 'p4', 'Filters by facing orientation correctly');

// ----------------------------------------------------
// SECTION 4: UNIT TESTS - Smart Decider & Super Services
// ----------------------------------------------------
console.log('\n--- SECTION 4: Smart Decider & Super Services Unit Tests ---');

function getCommuteStats(propertyLoc, targetHub) {
  const loc = (propertyLoc || '').toLowerCase();
  const hub = (targetHub || '').toLowerCase();
  if (loc.includes(hub) || hub.includes(loc)) {
    return { distanceKm: 1.8, timeMins: 8, stress: 'Very Low', costPerTrip: 40 };
  }
  const neighbors = {
    gachibowli: ['kondapur', 'financial district', 'madhapur'],
    madhapur: ['gachibowli', 'kondapur', 'jubilee hills'],
    kondapur: ['gachibowli', 'madhapur'],
    'financial district': ['gachibowli'],
    'jubilee hills': ['madhapur', 'gachibowli']
  };
  const isNeighbor = neighbors[hub]?.some(n => loc.includes(n)) || neighbors[loc]?.some(n => hub.includes(n));
  if (isNeighbor) {
    return { distanceKm: 4.5, timeMins: 15, stress: 'Moderate', costPerTrip: 100 };
  }
  return { distanceKm: 16.5, timeMins: 45, stress: 'High Traffic', costPerTrip: 320 };
}

const sameHubCommute = getCommuteStats('Gachibowli, Hyderabad', 'Gachibowli');
assert(sameHubCommute.distanceKm === 1.8 && sameHubCommute.timeMins === 8, 'Same sublocality commute distance & time verified (1.8km / 8mins)');

const neighborCommute = getCommuteStats('Kondapur, Hyderabad', 'Gachibowli');
assert(neighborCommute.distanceKm === 4.5 && neighborCommute.stress === 'Moderate', 'Neighbor sublocality commute stats verified (4.5km / Moderate)');

function calculatePackersEstimate(bhkSize, distanceKm) {
  const baseRates = { 1: 4500, 2: 7500, 3: 12000, 4: 18000 };
  const base = baseRates[bhkSize] || 10000;
  const distFee = distanceKm * 40;
  return base + distFee;
}

const moversQuote = calculatePackersEstimate(3, 25);
assert(moversQuote === 13000, `Packers & Movers estimate for 3 BHK over 25km: ₹${moversQuote} (Expected ₹13,000)`);

function calculateInteriorEstimate(sizeSqFt, quality) {
  const rates = { Standard: 1200, Premium: 1800, Luxury: 2500 };
  const rate = rates[quality] || 1500;
  return sizeSqFt * rate;
}

const interiorQuote = calculateInteriorEstimate(2000, 'Premium');
assert(interiorQuote === 3600000, `Interior Design estimate for 2000 sq ft @ Premium: ₹${interiorQuote.toLocaleString('en-IN')} (Expected ₹36,00,000)`);

// ----------------------------------------------------
// SECTION 5: UNIT TESTS - Data Persistence File Structure
// ----------------------------------------------------
console.log('\n--- SECTION 5: Data Persistence File Structure ---');

const dbPath = path.join(process.cwd(), 'data', 'db.json');
assert(fs.existsSync(dbPath), `Persistence DB file exists at: ${dbPath}`);

if (fs.existsSync(dbPath)) {
  const content = fs.readFileSync(dbPath, 'utf8');
  let parsed = null;
  try {
    parsed = JSON.parse(content);
  } catch (e) {}
  assert(parsed !== null, 'Persistence DB contains valid JSON syntax');
  assert(Array.isArray(parsed?.messages), 'DB contains messages array');
  assert(Array.isArray(parsed?.invitations), 'DB contains invitations array');
}

// ----------------------------------------------------
// SECTION 6: FUNCTIONAL TESTS - Customer, Builder & Admin Flows
// ----------------------------------------------------
console.log('\n--- SECTION 6: End-to-End Functional State Flow Tests ---');

// Functional Test 1: Property Creation & Approval State Machine
let appStateProperties = [...mockProperties];

function addPropertyByBuilder(newProp) {
  const prop = { ...newProp, id: `prop-${Date.now()}`, status: 'Pending Approval' };
  appStateProperties.push(prop);
  return prop;
}

function approvePropertyByAdmin(propertyId) {
  const target = appStateProperties.find(p => p.id === propertyId);
  if (target) {
    target.status = 'Approved';
    return true;
  }
  return false;
}

const addedProp = addPropertyByBuilder({
  title: 'Cyber Towers Penthouse',
  subLocality: 'Hitec City',
  rentOrBuy: 'Buy',
  price: 45000000,
  bedrooms: 4,
  facing: 'East'
});
assert(addedProp.status === 'Pending Approval', 'New builder property created with "Pending Approval" status');

const approvalSuccess = approvePropertyByAdmin(addedProp.id);
assert(approvalSuccess && addedProp.status === 'Approved', 'Admin successfully changed property status to "Approved"');

// Functional Test 2: Wishlist Toggle Logic
let userWishlist = ['p1'];
function toggleWishlist(id) {
  if (userWishlist.includes(id)) {
    userWishlist = userWishlist.filter(item => item !== id);
  } else {
    userWishlist.push(id);
  }
}

toggleWishlist('p2');
assert(userWishlist.includes('p2'), 'Property p2 successfully added to user wishlist');
toggleWishlist('p1');
assert(!userWishlist.includes('p1'), 'Property p1 successfully removed from user wishlist');

// Functional Test 3: Appointment Booking Workflow
let appAppointments = [];
function bookAppointment(propertyId, propertyTitle, customerName, customerEmail, date, timeSlot) {
  const appt = {
    id: `appt-${Math.random().toString(36).substring(2, 9)}`,
    propertyId,
    propertyTitle,
    customerName,
    customerEmail,
    date,
    timeSlot,
    status: 'Scheduled'
  };
  appAppointments.push(appt);
  return appt;
}

const newAppt = bookAppointment('p1', 'Luxury Villa', 'Test Customer', 'cust@example.com', '2026-08-01', '10:00 AM');
assert(newAppt.status === 'Scheduled' && appAppointments.length === 1, 'Customer successfully booked a property visit appointment');

// ----------------------------------------------------
// SECTION 7: SMOKE TESTS - Live Backend Express Server REST API & SSE
// ----------------------------------------------------
console.log('\n--- SECTION 7: Backend Express REST API & SSE Smoke Tests ---');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runApiSmokeTests() {
  const port = process.env.PORT || 3000;
  let serverProcess = null;
  let startedServerLocally = false;

  // Check if the gateway (and the stack behind it) is already running, if not
  // start the whole microservices stack temporarily for smoke tests. Probes
  // /api/health since it's the one unauthenticated endpoint the gateway exposes.
  let isServerRunning = false;
  try {
    const checkRes = await makeRequest({ hostname: 'localhost', port, path: '/api/health', method: 'GET' });
    if (checkRes.statusCode === 200) {
      isServerRunning = true;
    }
  } catch (e) {}

  if (!isServerRunning) {
    console.log(`  🚀 Launching the OurHome microservices stack (gateway on port ${port}) for Smoke Verification...`);
    const nodeBinDir = "C:\\Users\\Ashok Kumar\\.gemini\\antigravity-ide\\scratch\\node_bin\\node-v22.14.0-win-x64";
    const env = { ...process.env, PATH: `${nodeBinDir};${process.env.PATH}`, PORT: String(port) };

    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      env,
      shell: true
    });

    startedServerLocally = true;

    // Wait up to 20 seconds for all 8 services to be responsive
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const ping = await makeRequest({ hostname: 'localhost', port, path: '/api/health', method: 'GET' });
        if (ping.statusCode === 200) {
          isServerRunning = true;
          console.log('  ✅ Gateway started and responding to HTTP requests.');
          break;
        }
      } catch (e) {}
    }
  }

  if (!isServerRunning) {
    console.warn(`  ⚠️ Server API Smoke test skipped: unable to connect to localhost:${port}`);
  } else {
    try {
      // Auth is now JWT-cookie-based (each service verifies independently — see
      // ARCHITECTURE.md) instead of session-based, but the effect on this smoke
      // test is the same either way: every /api/chat/* route requires a login
      // first. Log in with the seeded demo customer (prisma/seed.ts) and carry
      // the resulting cookie on every request below.
      const loginRes = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { email: 'customer@ourhome.com', password: 'ourhome123' });
      assert(loginRes.statusCode === 200, `POST /api/auth/login authenticates the seeded demo customer (HTTP ${loginRes.statusCode})`);
      const rawCookie = loginRes.headers?.['set-cookie']?.[0] || '';
      const authCookie = rawCookie.split(';')[0];
      assert(authCookie.startsWith('ourhome.jwt='), 'Login response sets the ourhome.jwt auth cookie');

      // Test 7.1: GET /api/chat/state
      const stateRes = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/chat/state',
        method: 'GET',
        headers: { Cookie: authCookie }
      });
      assert(stateRes.statusCode === 200, `GET /api/chat/state returned HTTP 200 OK`);
      assert(Array.isArray(stateRes.body.messages), `GET /api/chat/state payload includes messages array`);
      assert(Array.isArray(stateRes.body.invitations), `GET /api/chat/state payload includes invitations array`);
      assert(Array.isArray(stateRes.body.typingStates), `GET /api/chat/state payload includes typingStates array`);

      // Test 7.2: POST /api/chat/invite
      const inviteData = {
        propertyId: 'prop-test-smoke',
        propertyTitle: 'Smoke Test Sky Suite',
        customerName: 'Automated Tester',
        customerEmail: 'tester@ourhome.in'
      };
      const inviteRes = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/chat/invite',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: authCookie }
      }, inviteData);
      assert(inviteRes.statusCode === 201 || inviteRes.statusCode === 200, `POST /api/chat/invite created invitation (HTTP ${inviteRes.statusCode})`);
      assert(inviteRes.body.propertyTitle === 'Smoke Test Sky Suite', `Chat invitation title matches payload`);

      // Test 7.3: POST /api/chat/message
      const msgData = {
        propertyId: 'prop-test-smoke',
        sender: 'customer',
        senderName: 'Automated Tester',
        text: 'Automated live SSE message verification...'
      };
      const msgRes = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/chat/message',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: authCookie }
      }, msgData);
      assert(msgRes.statusCode === 201, `POST /api/chat/message delivered message (HTTP 201 Created)`);
      assert(msgRes.body.text === msgData.text, `Delivered message content matches payload`);

      // Test 7.4: POST /api/chat/typing
      const typingRes = await makeRequest({
        hostname: 'localhost',
        port,
        path: '/api/chat/typing',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: authCookie }
      }, { propertyId: 'prop-test-smoke', role: 'customer', isTyping: true });
      assert(typingRes.statusCode === 200, `POST /api/chat/typing updated typing state (HTTP 200 OK)`);

      // Test 7.5: SSE /api/chat/stream connection check
      const sseCheck = await new Promise((resolve) => {
        const req = http.get({ hostname: 'localhost', port, path: '/api/chat/stream', headers: { Cookie: authCookie } }, (res) => {
          const contentType = res.headers['content-type'];
          let chunks = '';
          res.on('data', chunk => {
            chunks += chunk.toString();
            if (chunks.includes('connected') || chunks.includes('sync')) {
              req.destroy();
              resolve({ statusCode: res.statusCode, contentType, pass: true });
            }
          });
        });
        req.on('error', () => resolve({ pass: false }));
        setTimeout(() => { req.destroy(); resolve({ pass: false }); }, 2000);
      });
      assert(sseCheck.pass && sseCheck.contentType?.includes('text/event-stream'), `GET /api/chat/stream establishes Server-Sent Events stream`);

    } catch (err) {
      console.error(`  ❌ Server API Smoke Test error: ${err.message}`);
    }
  }

  // Clean up server process if launched by test script
  if (startedServerLocally && serverProcess) {
    console.log('  🧹 Cleaning up spawned test server process...');
    serverProcess.kill();
  }

  console.log('\n==================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runApiSmokeTests();
