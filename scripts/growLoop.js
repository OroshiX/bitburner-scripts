import {allServers} from '/scripts/all-servers.js';
/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0] ??
                   await ns.prompt("Choose a target", {type: "select", choices: allServers.map((e) => e.hostname)});
    while(true) {
        await ns.grow(target);
    }
}