import { PeerServer } from 'peer';
import os from 'os';

const PORT = parseInt(process.env.PEER_PORT || '9000', 10);

const server = PeerServer({
    port: PORT,
    path: '/',
    key: 'peerjs',
    allow_discovery: true,
});

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

console.log(`\n======================================================`);
console.log(`📡 PeerJS Signaling Server đang chạy thành công!`);
console.log(`   - Local:    http://localhost:${PORT}`);
console.log(`   - Network:  http://${localIP}:${PORT}`);
console.log(`   - Port:     ${PORT}`);
console.log(`   - Key:      peerjs`);
console.log(`   - Path:     /`);
console.log(`\n💡 Cấu hình cho .env trên cùng máy:`);
console.log(`   VITE_APP_PEER_SERVER=localhost`);
console.log(`   VITE_APP_PEER_PORT=${PORT}`);
console.log(`   VITE_APP_PEER_SECURE=0`);
console.log(`   VITE_APP_PEER_KEY=peerjs`);
console.log(`\n💡 Nếu kết nối từ điện thoại/tablet cùng mạng Wi-Fi:`);
console.log(`   VITE_APP_PEER_SERVER=${localIP}`);
console.log(`======================================================\n`);

server.on('connection', (client) => {
    console.log(`[PeerJS] Thiết bị kết nối: ${client.getId()}`);
});

server.on('disconnect', (client) => {
    console.log(`[PeerJS] Thiết bị ngắt kết nối: ${client.getId()}`);
});
