import {allServers} from "/js/all-servers.js";
import {NS} from "Bitburner";

/** @param {NS} ns */
export async function main(ns: NS) {
    const target: string = <string>ns.args[0] ??
        await ns.prompt("Choose a target",
            {type: "select", choices: allServers.map((e) => e.hostname)});
    while (true) {
        await ns.grow(target);
    }
}