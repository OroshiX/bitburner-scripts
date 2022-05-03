import {allServers} from '/hacking/all-servers.js';
/** @param {NS} ns */
export async function main(ns) {
    let list = ns.scan();
    let scripts = ns.ls(ns.getHostname(), ".js");
    let scriptName = await ns.prompt("Script to run", { type: "select", choices: scripts });
    let targets = allServers.map((s) => s.hostname);
    let target = await ns.prompt("Target", { type: "select", choices: targets });
    let nb: string[] = [];
    for (let i = 0; i < 10; i++) {
        nb[i] = i.toString();
    }
    let nbArgs = await ns.prompt("Nb of args", { type: "select", choices: nb });
    let args: string[] = [];
    for (let i = 0; i < parseInt(nbArgs); i++) {
        args[i] = await ns.prompt(`Argument ${i + 1}`, { type: "text" });
    }
    ns.print("list ", list);
    for (let e of allServers) {
        if (e.purchasedByPlayer) {
            ns.print("copying on ", e);
            await ns.scp(scriptName, e.hostname);
            ns.print("executing " + scriptName + " on target " + target);
            ns.exec(scriptName, e.hostname, 1, target, ...args);
        }
    }
}