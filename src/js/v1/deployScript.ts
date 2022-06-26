import {allServers} from "/js/all-servers.js";

/** @param {NS} ns */
export async function main(ns) {
    const list = ns.scan();
    const scripts = ns.ls(ns.getHostname(), ".js");
    const scriptName = await ns.prompt("Script to run", {type: "select", choices: scripts});
    const targets = allServers.map((s) => s.hostname);
    const target = await ns.prompt("Target", {type: "select", choices: targets});
    const nb: string[] = [];
    for (let i = 0; i < 10; i++) {
        nb[i] = i.toString();
    }
    const nbArgs = await ns.prompt("Nb of args", {type: "select", choices: nb});
    const args: string[] = [];
    for (let i = 0; i < parseInt(nbArgs); i++) {
        args[i] = await ns.prompt(`Argument ${i + 1}`, {type: "text"});
    }
    ns.print("list ", list);
    for (const e of allServers) {
        if (e.purchasedByPlayer) {
            ns.print("copying on ", e);
            await ns.scp(scriptName, e.hostname);
            ns.print(`executing ${scriptName} on target ${target}`);
            ns.exec(scriptName, e.hostname, 1, target, ...args);
        }
    }
}