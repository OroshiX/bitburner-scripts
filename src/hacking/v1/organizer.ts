import {NS} from "Bitburner";

export async function main(ns: NS) {
    const target: string = <string>ns.args[0] ?? 'iron-gym';
    const hackRam = ns.getScriptRam('hack.js');
    const growRam = ns.getScriptRam('grow.js');
    const weakenRam = ns.getScriptRam('weaken.js');

    const moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    const securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    const running: string = <string>ns.args[1] ?? ns.getHostname();

    while (true) {
        const homeMaxRam = ns.getServerMaxRam(running);
        // recalculate times each loop, because security will vary
        const hackTime = ns.getHackTime(target);
        const growTime = ns.getGrowTime(target);
        const weakenTime = ns.getWeakenTime(target);

        // Weaken thread calculation
        const minSec = ns.getServerMinSecurityLevel(target);
        const security = ns.getServerSecurityLevel(target);
        let weakenThreads = Math.ceil((security - minSec) / ns.weakenAnalyze(1));

        // Hack thread calc
        let money = ns.getServerMoneyAvailable(target);
        if (money <= 0) money = 1;// no division by 0
        let hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, money));

        // Grow thread calc
        let maxMoney = ns.getServerMaxMoney(target);
        let growThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / money));

        // Max threads calc
        let homeUsedRam = ns.getServerUsedRam(running);
        let availableRam = homeMaxRam - homeUsedRam;
        let maxThreads = Math.floor(availableRam / Math.max(hackRam, growRam, weakenRam));

        let scriptName;
        let threads;
        let sleepTime;
        if (security > securityThresh) {
            // server security is above our threshold, so weaken it
            scriptName = 'weaken.js';
            weakenThreads = Math.min(maxThreads, weakenThreads);
            threads = weakenThreads;
            sleepTime = weakenTime;
        } else if (money < moneyThresh) {
            // if the server's money is less than our threshold, grow it
            growThreads = Math.min(maxThreads, growThreads);
            scriptName = 'grow.js';
            threads = growThreads;
            sleepTime = growTime;
        } else {
            // hack it
            hackThreads = Math.min(maxThreads, hackThreads);
            scriptName = 'hack.js';
            threads = hackThreads;
            sleepTime = hackTime;
        }
        if (threads > 0) {
            ns.exec(scriptName, running, threads, target);
            await ns.sleep(sleepTime);
        }
        while (ns.scriptRunning(scriptName, running)) {
            await ns.sleep(20);
        }
    }
}