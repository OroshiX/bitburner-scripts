/** @param {NS} ns */
import {NS} from "Bitburner";
import {scriptGrow, scriptHack, scriptWeaken} from "/js/script-names";

export async function main(ns: NS) {
    const target: string = <string>ns.args[0] ?? 'iron-gym';
    const targetRun: string = <string>ns.args[1] ?? ns.getHostname();
    ns.print(
        `running bis-organizer with target ${target}, and targetRun ${targetRun}, on host ${ns.getHostname()}`);
    const home = `home`;
    if (!ns.fileExists(scriptHack, targetRun) || !ns.fileExists(scriptWeaken, targetRun) ||
        !ns.fileExists(scriptGrow, targetRun)) {
        ns.tprint(
            `Error, the 3 files ${scriptHack}, ${scriptGrow} and ${scriptWeaken} should exist on ${targetRun} but they don't`);
        return;
    }
    const interval = 30; // interval of security between operations
    const hackRam = ns.getScriptRam(scriptHack, targetRun);
    const growRam = ns.getScriptRam(scriptGrow, targetRun);
    const weakenRam = ns.getScriptRam(scriptWeaken, targetRun);

    const maxMoney = ns.getServerMaxMoney(target);
    const moneyThresh = maxMoney * 0.75;
    const minSec = ns.getServerMinSecurityLevel(target);
    const securityThresh = minSec + 5;
    ns.print(
        `maxMoney: ${maxMoney}, thresh: ${moneyThresh}, minSec: ${minSec}, secThresh: ${securityThresh}, hackRAM: ${hackRam}, growRAM: ${growRam}, weakRAM: ${weakenRam}`);
    let partGrow = 1 / 6;
    let partWeaken = 5 / 6;
    let money = ns.getServerMoneyAvailable(target);
    let security = ns.getServerSecurityLevel(target);
    if (ns.getServerMaxRam(targetRun) === 0) return;
    while (security > securityThresh || money < moneyThresh) {
        if (money === 0) {
            money = 1;
        }
        let availableRam = ns.getServerMaxRam(targetRun) - ns.getServerUsedRam(targetRun);
        // recalculate times each loop, because security will vary
        const growTime = ns.getGrowTime(target);
        const weakenTime = ns.getWeakenTime(target);
        ns.print(
            `looping in, hostname: ${ns.getHostname()}, targetRun: ${targetRun}, availableRam: ${availableRam}, grow: ${growTime}ms, weak: ${weakenTime} ms`);
        var sleepTime = 0;
        // Weaken thread calculation
        let requiredWeakenThreads = Math.ceil((security - minSec) / ns.weakenAnalyze(1));
        let maxWeakenThreads = Math.floor(availableRam * partWeaken / weakenRam);
        let weakenThreads = Math.min(requiredWeakenThreads, maxWeakenThreads);
        if (weakenThreads > 0) {
            ns.exec(scriptWeaken, targetRun, weakenThreads, target);
            sleepTime += weakenTime;
        }
        ns.print(
            `weak threads: ${weakenThreads}, required: ${requiredWeakenThreads}, maxThreads: ${maxWeakenThreads}`);

        availableRam = availableRam - weakenThreads * weakenRam;
        // Grow thread calc
        let requiredGrowThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / money));
        let maxGrowThreads = Math.floor(availableRam / growRam);
        let growThreads = Math.min(requiredGrowThreads, maxGrowThreads);
        if (growThreads > 0) {
            ns.exec(scriptGrow, targetRun, growThreads, target);
            sleepTime += growTime;
        }
        ns.print(
            `GRow threads: ${growThreads}, required: ${requiredGrowThreads}, maxThreads: ${maxGrowThreads}`);
        await ns.sleep(sleepTime + interval);
        money = ns.getServerMoneyAvailable(target);
        security = ns.getServerSecurityLevel(target);
        ns.print(`end of 1st loop: money=${money}, security=${security}`);
    }

    ns.print(">>>>>> Now the server is correctly prepared, so launch phase 2");
    const partHack = 1 / 13;
    partGrow = 2 / 13;
    partWeaken = 10 / 13;

    while (true) {
        let availableRam = ns.getServerMaxRam(targetRun) - ns.getServerUsedRam(targetRun);
        // recalculate times each loop, because security will vary
        const hackTime = ns.getHackTime(target);
        const growTime = ns.getGrowTime(target);
        const weakenTime = ns.getWeakenTime(target);

        // Weaken thread calculation
        security = ns.getServerSecurityLevel(target);
        let requiredWeakenThreads = Math.ceil((security - minSec) / ns.weakenAnalyze(1));
        let maxWeakenThreads = Math.floor(availableRam * partWeaken / weakenRam);
        let weakenThreads = Math.min(requiredWeakenThreads, maxWeakenThreads);
        let weakenT1 = Math.ceil(weakenThreads / 2);
        let weakenT2 = weakenThreads - weakenT1;

        // Grow thread calc
        let requiredGrowThreads = Math.ceil(ns.growthAnalyze(target, maxMoney / money));
        let maxGrowThreads = Math.floor(availableRam * partGrow / growRam);
        let growThreads = Math.min(requiredGrowThreads, maxGrowThreads);


        // Hack thread calc
        availableRam -= (weakenT1 + weakenT2) * weakenRam + growThreads * growRam;
        money = ns.getServerMoneyAvailable(target);
        if (money <= 0) money = 1;// no division by 0
        let requiredHackThreads = Math.ceil(ns.hackAnalyzeThreads(target, money));
        let maxHackThreads = Math.floor(availableRam / hackRam);
        let hackThreads = Math.min(requiredHackThreads, maxHackThreads);


        if (weakenT1 > 0) {
            ns.exec(scriptWeaken, targetRun, weakenT1, target);
        }
        // B starts
        await ns.sleep(interval * 2);
        if (weakenT2 > 0) {
            ns.exec(scriptWeaken, targetRun, weakenT2, target, "second");
        }
        // C starts
        await ns.sleep(weakenTime - interval - growTime);
        if (growThreads > 0) {
            ns.exec(scriptGrow, targetRun, growThreads, target);
        }
        // D starts
        await ns.sleep(growTime - 2 * interval - hackTime);
        if (hackThreads > 0) {
            ns.exec(scriptHack, targetRun, hackThreads, target);
        }
        // restart loop
        await ns.sleep(hackTime + 4 * interval); // todo to change this
    }
}

/**
 * @param targetRun {Server}
 * @param target
 */
function calculateGrow(targetRun, target) {

}

export class Operation {
    threads;
    time;

    constructor(threads, time) {
        this.threads = threads;
        this.time = time;
    }
}