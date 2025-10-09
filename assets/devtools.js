let sidebarlist_class = "div.sidebarList_c48ade";
let container_index = 0;
let scroller_index = 4;
let channels_index = 0;

// to add your avatar remove checks: if (id !== my_id) 

let icon_muted = "m2.7 22.7 20-20a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4ZM10.8 17.32c-.21.21-.1.58.2.62V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.06A8 8 0 0 0 20 10a1 1 0 0 0-2 0c0 1.45-.52 2.79-1.38 3.83l-.02.02A5.99 5.99 0 0 1 12.32 16a.52.52 0 0 0-.34.15l-1.18 1.18ZM15.36 4.52c.15-.15.19-.38.08-.56A4 4 0 0 0 8 6v4c0 .3.03.58.1.86.07.34.49.43.74.18l6.52-6.52ZM5.06 13.98c.16.28.53.31.75.09l.75-.75c.16-.16.19-.4.08-.61A5.97 5.97 0 0 1 6 10a1 1 0 0 0-2 0c0 1.45.39 2.81 1.06 3.98Z";
let icon_muted_by_server = "M12 2c.33 0 .51.35.4.66a6.99 6.99 0 0 0 3.04 8.37c.2.12.31.37.21.6A4 4 0 0 1 8 10V6a4 4 0 0 1 4-4Z";
let icon_deafened_by_server = "M12.38 1c.38.02.58.45.4.78-.15.3-.3.62-.4.95A.4.4 0 0 1 12 3a9 9 0 0 0-8.95 10h1.87a5 5 0 0 1 4.1 2.13l1.37 1.97a3.1 3.1 0 0 1-.17 3.78 2.85 2.85 0 0 1-3.55.74 11 11 0 0 1 5.71-20.61ZM22.22 11.22c.34-.18.76.02.77.4L23 12a11 11 0 0 1-5.67 9.62c-1.27.71-2.73.23-3.55-.74a3.1 3.1 0 0 1-.17-3.78l1.38-1.97a5 5 0 0 1 4.1-2.13h1.86c.03-.33.05-.66.05-1a.4.4 0 0 1 .27-.38c.33-.1.65-.25.95-.4Z";
let icon_deafened = "M22.7 2.7a1 1 0 0 0-1.4-1.4l-20 20a1 1 0 1 0 1.4 1.4l20-20ZM17.06 2.94a.48.48 0 0 0-.11-.77A11 11 0 0 0 2.18 16.94c.14.3.53.35.76.12l3.2-3.2c.25-.25.15-.68-.2-.76a5 5 0 0 0-1.02-.1H3.05a9 9 0 0 1 12.66-9.2c.2.09.44.05.59-.1l.76-.76ZM20.2 8.28a.52.52 0 0 1 .1-.58l.76-.76a.48.48 0 0 1 .77.11 11 11 0 0 1-4.5 14.57c-1.27.71-2.73.23-3.55-.74a3.1 3.1 0 0 1-.17-3.78l1.38-1.97a5 5 0 0 1 4.1-2.13h1.86a9.1 9.1 0 0 0-.75-4.72ZM10.1 17.9c.25-.25.65-.18.74.14a3.1 3.1 0 0 1-.62 2.84 2.85 2.85 0 0 1-3.55.74.16.16 0 0 1-.04-.25l3.48-3.48Z";

function querySelector(query) {
	try {
		return document.querySelector(query);
	}
	catch(e) {
		return undefined;
	}
}

let prev_butt = querySelector("button#blablablabla");
if (prev_butt) {
	prev_butt.parentElement.removeChild(prev_butt);
	try { ws?.close(); } catch(e) {}
	try { if (observer) {
		observer.sidebarlist?.disconnect();
		observer.channels?.disconnect();
	} } catch(e) {}
}

let body = querySelector("body");
let butt = document.createElement("button");
let elements = {
	sidebarlist: undefined,
	channels: undefined,
	channel: undefined,
};
let my_id;
let enabled = false;
let observer = {
	sidebarlist: undefined,
	channels: undefined
};
let ws;

function sendWS(text) {
	ws?.send(text);
}

function disconnectObserver(key) {
	if (!observer[key]) return;
	observer[key].disconnect();
	observer[key] = undefined;
}

function getIDAndURLFromBackgroundImage(backgroundImage) {
	var url = backgroundImage.substring(backgroundImage.indexOf(`"`) + 1, backgroundImage.indexOf(".webp") + 5);
	var id = url.substring(url.indexOf("avatars/") + 8);
	id = id.substring(0, id.indexOf("/"));
	return { id, url };
}

function updateButtLabel(err) {
	butt.innerText = `${enabled ? "Disable" : "Enable"} speaking avatar capturing`;
	if (err) {
		enabled = true;
		console.error(`[Discord Avatars to OBS] ${err}`);
		butt.onclick();
	}
}

butt.id = "blablablabla";
butt.style = "position: absolute; top: 35px; left: 0px;";
updateButtLabel();
butt.onclick = async() => {
	enabled = !enabled;
	butt.innerText = `Connecting...`;

	for (const k of Object.keys(observer)) disconnectObserver(k);

	if (enabled) {
		ws = new WebSocket("ws://127.0.0.1:62521");
		const err = await new Promise(resolve => {
			let t = setTimeout(() => resolve(`server is not responding`), 10000);
			ws.onopen = e => {
				ws.send("0,devtools");
				clearTimeout(t);
				resolve(undefined);
				ws.onopen = () => {};
			};
		});
		if (err)
			return updateButtLabel(err);
		ws.onclose = ({ code, reason }) => {
			updateButtLabel(`server was disconnected with ${code} - ${reason}`);
			ws = undefined;
		};

		elements.sidebarlist = querySelector(sidebarlist_class);
		if (!elements.sidebarlist) return updateButtLabel(`${sidebarlist_class} is not found`);
		elements.channels = elements.sidebarlist.children[container_index]?.children[scroller_index]?.children[channels_index];
		if (!elements.channels) return updateButtLabel(`${sidebarlist_class}[${container_index}][${scroller_index}][${channels_index}] is not found`);

		setupSidebarlistObserver();
		setupChannelsObserver();

		addUsersIfYouCurrentlyInChannel();
	}
	else {
		ws?.close();
	}

	updateButtLabel();
};
body.appendChild(butt);

function addUsersIfYouCurrentlyInChannel() {
	for (const el of elements.channels.children) if (el.classList.contains("containerDefault_c69b6d")) {
		//console.log(el);
		for (const el1 of el.children) if (el1.classList.contains("list_c3cd7d")) {
			elements.channel = el1;
			for (const draggable of el1.children) {
				const content = draggable.children[0].children[1];
				const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
				if (id === my_id) {
					for (const draggable of el1.children) {
						const content = draggable.children[0].children[1];
						const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
						if (id !== my_id) {
							sendWS(`1,add,${id},${url}`);
							for (const icons of content.children) if (icons.classList.contains("icons__07f91")) {
								const icon_group = icons.children[0];
								for (const icon of icon_group.children) {
									if (icon.children[0].getAttribute("d") === icon_muted) sendWS(`1,muted,${id},${url}`);
									else if (icon.children[1].getAttribute("d") === icon_muted_by_server) sendWS(`1,muted_by_server,${id},${url}`);
									else if (icon.children[0].getAttribute("d") === icon_deafened) sendWS(`1,deafened,${id},${url}`);
									else if (icon.children[1].getAttribute("d") === icon_deafened_by_server) sendWS(`1,deafened_by_server,${id},${url}`);
								}
								break;
							}
						}
					}
					return;
				}
			}
		}
	}
}

function setupSidebarlistObserver() {
	observer.sidebarlist = new MutationObserver(onSidebarlistMutations);
	observer.sidebarlist.observe(elements.sidebarlist, { childList: true });
}
function onSidebarlistMutations(mutations) {
	// guild was changed
	for (const mutation of mutations) {
		if (mutation.addedNodes.length < 1) continue;
		elements.channels = mutation.addedNodes[0].children[scroller_index]?.children[channels_index];
		if (!elements.channels) return updateButtLabel(`observer.sidebarlist$mutation.addedNode[${scroller_index}][${channels_index}] is not found`);

		setupChannelsObserver();
	}
}

function setupChannelsObserver() {
	const panels = elements.sidebarlist.parentElement.children[3];
	my_id = getIDAndURLFromBackgroundImage(panels.children[panels.children.length - 1].children[0].children[0].children[0].children[1].children[0].children[0].src).id;

	disconnectObserver("channels");
	observer.channels = new MutationObserver(onChannelsMutations);
	observer.channels.observe(elements.channels, { childList: true, attributes: true, subtree: true });
}
function onChannelsMutations(mutations) {
	for (const mutation of mutations) {
		// adding/removing avatars
		if (mutation.type === "childList") {
			const added = mutation.addedNodes.length > 0;
			const node = added ? mutation.addedNodes[0] : mutation.removedNodes[0];
			if (node.classList.contains("list_c3cd7d")) {
				// discord fucked up guilds when exactly when i wrote this line LOL
				// Sep 08, 2025 - 14:24 PDT
				// We're investigating an issue where some guilds are unavailable to some members.
				// This issue has worsened and is causing widespread availability issues. We are working as quickly as possible to restore traffic.
				// LMAO
				const content = node.children[0].children[0].children[1];
				const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
				if (id === my_id) {
					// first user in voice channel was added or last user in voice channel was removed
					elements.channel = added ? node : undefined;
					//console.log(elements.channel);
					//setupChannelObserver();
				}
			}
			else if (node.classList.contains("draggable__55bab")) {
				//console.log(mutation);
				const content = node.children[0].children[1];
				const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
				if (added) {
					//console.log(`added ${id}`);
					if (id !== my_id) sendWS(`1,add,${id},${url}`);
					if (id === my_id) {
						elements.channel = node.parentElement;
						//console.log(elements.channel);
						if (elements.channel.children.length > 1) for (const draggable of elements.channel.children) {
							const content = draggable.children[0].children[1];
							const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
							if (id === my_id) continue;
							//console.log(`has ${id}`);
							if (id !== my_id) sendWS(`1,add,${id},${url}`);
						}
					}
				}
				else {
					//console.log(`removed ${id}`);
					if (id !== my_id) sendWS(`1,remove,${id},${url}`);
					if (id === my_id) {
						if (elements.channel.children.length > 1) for (const draggable of elements.channel.children) {
							const content = draggable.children[0].children[1];
							const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
							if (id === my_id) continue;
							//console.log(`has ${id}`);
							if (id !== my_id) sendWS(`1,remove,${id},${url}`);
						}
						elements.channel = undefined;
						//console.log(elements.channel);
					}
				}
			}
			else if (mutation.target.classList.contains("iconGroup__07f91")) {
				const content = mutation.target.parentElement.parentElement;
				const { id, url } = getIDAndURLFromBackgroundImage(content.children[0].style.backgroundImage);
				if (id !== my_id) {
					const not_prefix = added ? "" : "not_";
					if (node.classList.contains("iconServer__07f91")) {
						const d = node.children[1].getAttribute("d");
						if (d === icon_muted_by_server) sendWS(`1,${not_prefix}muted_by_server,${id},${url}`);
						if (d === icon_deafened_by_server) sendWS(`1,${not_prefix}deafened_by_server,${id},${url}`);
					}
					else {
						const d = node.children[0].getAttribute("d");
						if (d === icon_muted) sendWS(`1,${not_prefix}muted,${id},${url}`);
						if (d === icon_deafened) sendWS(`1,${not_prefix}deafened,${id},${url}`);
					}
				}
			}
		}
		// setting values
		else {
			const node = mutation.target;
			if (node.classList.contains("userAvatar__55bab") && elements.channel === node.parentElement.parentElement.parentElement.parentElement) {
				// avatarSpeaking__07f91
				const { id, url } = getIDAndURLFromBackgroundImage(node.style.backgroundImage);
				//console.log(id, node.classList.contains("avatarSpeaking__07f91"));
				if (id !== my_id) sendWS(`1,${node.classList.contains("avatarSpeaking__07f91") ? "speaking" : "not_speaking"},${id},${url}`);
			}
			//else
				//console.log(false, mutation);
		}
	}
}