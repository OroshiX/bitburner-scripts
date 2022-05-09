import {NS} from "Bitburner";

export async function main(ns: NS) {
    const target: string = <string>ns.args[0];
    const minMoney: number = <number>ns.args[1] ?? 0.75;
    const maxSec: number = <number>ns.args[2] ?? 5;
    const moneyThresh = ns.getServerMaxMoney(target) * minMoney;
    const securityThresh = ns.getServerMinSecurityLevel(target) + maxSec;
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(target);
    }
    ns.nuke(target);
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        } else {
            await ns.hack(target);
        }
    }
}