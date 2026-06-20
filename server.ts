import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// ESM/CJS path resolution helper (guarded safely if needed, otherwise using process.cwd() for direct pathing)

// In-memory data store for live real-time chats, invitations, and active states
interface Message {
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

interface ChatInvitation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerEmail: string;
  timestamp: number;
  active: boolean;
}

interface TypingState {
  propertyId: string;
  role: 'customer' | 'builder';
  isTyping: boolean;
}

let messages: Message[] = [
  {
    id: 'm1',
    propertyId: 'prop-1',
    sender: 'builder',
    senderName: 'Arjun Nandan',
    text: 'Hello! Welcome to the premium listing of Gachibowli Sky Penthouse. How may I assist your custom queries today?',
    timestamp: Date.now() - 36500000
  }
];

let invitations: ChatInvitation[] = [];
let typingStates: TypingState[] = [];
let sseClients: any[] = [];

// Helper function to broadcast SSE events to all connected players/roles
function broadcast(payload: any) {
  const data = JSON.stringify(payload);
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (err) {
      // Clean up stale reference
      console.error('Error broadcasting to client:', err);
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Use JSON middleware
  app.use(express.json());

  // SSE Channel for dynamically streaming messages, invitations, and typing indicators
  app.get('/api/chat/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send single line comment to handshake
    res.write(': connected\n\n');

    // Keep SSE connection alive
    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 12000);

    // Sync current snapshot state
    res.write(`data: ${JSON.stringify({ type: 'sync', messages, invitations, typingStates })}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients = sseClients.filter((client) => client !== res);
    });
  });

  // REST endpoints for interacting with the messaging canvas
  app.get('/api/chat/state', (req, res) => {
    res.json({ messages, invitations, typingStates });
  });

  app.post('/api/chat/message', (req, res) => {
    const { propertyId, sender, senderName, text, attachment } = req.body;
    if (!propertyId || !sender || !senderName) {
      res.status(400).json({ error: 'Missing required message parameters' });
      return;
    }

    const newMessage: Message = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      sender,
      senderName,
      text: text || '',
      timestamp: Date.now(),
      attachment
    };

    messages.push(newMessage);

    // Disable active typing state since the message is now delivered
    typingStates = typingStates.filter(t => !(t.propertyId === propertyId && t.role === sender));

    // Broadcast update
    broadcast({ type: 'msg', message: newMessage });
    broadcast({ type: 'typing_sync', typingStates });

    res.status(201).json(newMessage);
  });

  app.post('/api/chat/typing', (req, res) => {
    const { propertyId, role, isTyping } = req.body;
    if (!propertyId || !role) {
      res.status(400).json({ error: 'Missing required typing parameters' });
      return;
    }

    // Filter out previous state and push new state if true
    typingStates = typingStates.filter(t => !(t.propertyId === propertyId && t.role === role));
    if (isTyping) {
      typingStates.push({ propertyId, role, isTyping: true });
    }

    broadcast({ type: 'typing_sync', typingStates });
    res.json({ success: true, typingStates });
  });

  app.post('/api/chat/invite', (req, res) => {
    const { propertyId, propertyTitle, customerName, customerEmail } = req.body;
    if (!propertyId || !propertyTitle || !customerName) {
      res.status(400).json({ error: 'Missing required invitation parameters' });
      return;
    }

    // Check if an active invitation already exists for this property
    const existing = invitations.find(inv => inv.propertyId === propertyId && inv.customerEmail === customerEmail && inv.active);
    if (existing) {
      res.json(existing);
      return;
    }

    const newInvite: ChatInvitation = {
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      propertyTitle,
      customerName,
      customerEmail: customerEmail || 'anonymous@ourhome.com',
      timestamp: Date.now(),
      active: true
    };

    invitations.push(newInvite);

    broadcast({ type: 'invite', invitation: newInvite });
    res.status(201).json(newInvite);
  });

  // End point for clear simulation/logs resetting
  app.post('/api/chat/clear', (req, res) => {
    messages = [
      {
        id: 'm1',
        propertyId: 'prop-1',
        sender: 'builder',
        senderName: 'Arjun Nandan',
        text: 'Hello! Welcome to the premium listing of Gachibowli Sky Penthouse. How may I assist your custom queries today?',
        timestamp: Date.now() - 36500000
      }
    ];
    invitations = [];
    typingStates = [];
    broadcast({ type: 'sync', messages, invitations, typingStates });
    res.json({ success: true, message: 'States fully purged' });
  });

  // Vite middleware integration for asset pipelines
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Full-stack] Node Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
