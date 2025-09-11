import fs from "fs";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const server = createServer((req, res) => {
	res.setHeader("Content-Type", "text/html");
	if (req.method === "GET") {
		if (req.url === "/mute.png") {
			res.setHeader("Content-Type", "image/png");
			res.write(fs.readFileSync("mute.png"));
		}
		else
			res.write(fs.readFileSync("index.html").toString());
	}
	else {
		res.write("<div>405 Method Not Allowed</div>");
		res.statusCode = 405;
	}
	res.end();
});
server.listen(62520);

const avatars = {};

const clients = {
	devtools: undefined,
	browser: []
};
const wss = new WebSocketServer({
	host: "127.0.0.1",
	port: 62521
});
wss.on("connection", (ws, req) => {
	ws.on("message", e => {
		const args = e.toString().split(",");
		if (args[0] === "0") {
			console.log(`connected: ${args[1]}`);
			ws.type = args[1];
			if (ws.type === "devtools") {
				clients.devtools = ws;
			}
			else {
				clients.browser.push(ws);
				for (const [id, { url, muted, muted_by_server, deafened, deafened_by_server }] of Object.entries(avatars)) {
					ws.send(`1,add,${id},${url}`);
					if (muted) ws.send(`1,muted,${id},${url}`);
					if (muted_by_server) ws.send(`1,muted_by_server,${id},${url}`);
					if (deafened) ws.send(`1,deafened,${id},${url}`);
					if (deafened_by_server) ws.send(`1,deafened_by_server,${id},${url}`);
				}
			}
		}
		else if (ws.type === "devtools" && args[0] === "1") {
			console.log(`${ws.type}: ${args[1]} - ${args[2]}`);
			if (args[1] === "add")
				avatars[args[2]] = {
					url: args[3],
					muted: false,
					muted_by_server: false,
					deafened: false,
					deafened_by_server: false
				};
			else if (args[1] === "remove") delete avatars[args[2]];
			else if (args[1] === "muted") avatars[args[2]].muted = true;
			else if (args[1] === "not_muted") avatars[args[2]].muted = false;
			else if (args[1] === "muted_by_server") avatars[args[2]].muted_by_server = true;
			else if (args[1] === "not_muted_by_server") avatars[args[2]].muted_by_server = false;
			else if (args[1] === "deafened") avatars[args[2]].deafened = true;
			else if (args[1] === "not_deafened") avatars[args[2]].deafened = false;
			else if (args[1] === "deafened_by_server") avatars[args[2]].deafened_by_server = true;
			else if (args[1] === "not_deafened_by_server") avatars[args[2]].deafened_by_server = false;
			for (const ws of clients.browser)
				ws.send(args.join(","));

		}
	});
	ws.on("close", () => {
		console.log(`disconnected: ${ws.type}`);
		if (ws.type === "devtools") {
			for (const ws of clients.browser) for (const [id, { url }] of Object.entries(avatars))
				ws.send(`1,remove,${id},${url}`);
			for (const id of Object.keys(avatars)) delete avatars[id];
			clients.devtools = undefined;
		}
		else {
			for (let i = 0; i < clients.browser.length; i++) if (ws === clients.browser[i]) {
				clients.browser.splice(i, 1);
				break;
			}
		}
	});
});
console.log("Initialized");