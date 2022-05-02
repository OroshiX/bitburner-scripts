import { allServers } from "/scripts/all-servers.js";
/** @param {NS} ns */
export async function main(ns) {
    // var file = await ns.read("servers.txt");
    const list = allServers;
    let i       = 0;
    let next = ns.args[i];
    let targets = [];
    while (i < 10 && next !== undefined) {
        targets[i] = next;
        i++;
        next = ns.args[i];
    }
    if (targets.length === 0) {
        let nbTargets = await ns.prompt("Choose the number of targets", { type: "select", choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] });
        if (nbTargets === undefined) {
            ns.tprint("Cancelling deploy");
            return;
        }
        nbTargets = parseInt(nbTargets);
        var listServers = getSortedListServers(list, ns.getHackingLevel());
        for (i = 0; i < nbTargets; i++) {
            const chosen = await ns.prompt(`choose the target No: ${i + 1}`,
                                           {type: "select", choices: listServers.map((e) => e.hostname)});
            targets[i] = chosen;
            const index = listServers.findIndex((e) => e.hostname === chosen);
            if (index !== -1) {
                listServers.splice(index, 1);
            }
        }
    }

    const scripts = ns.ls('home', ".js");
    const script  = await ns.prompt("Choose a script to deploy", {type: "select", choices: scripts});
    if (script === undefined) {
        ns.tprint("Please choose a script");
        return;
    }
    ns.tprint(`Next time you can call :\n\trun ${ns.getScriptName()} ${targets.join(" ")}`);
    for (const s of list) {
        ns.print(`server ${s.hostname}`);
        if (!s.hasAdminRights) {
            ns.print(`${s.hostname} has no admin rights`)
            if (s.numOpenPortsRequired > s.openPortCount) {
                ns.print("Opening ports on server " + s + ", needs " + s.numOpenPortsRequired + " to open");
                if (!s.ftpPortOpen && ns.fileExists('FTPCrack.exe', 'home')) {
                    ns.ftpcrack(s);
                }
                if (!s.sshPortOpen && ns.fileExists('BrunteSSH.exe', 'home')) {
                    ns.brutessh(s);
                }
                if (!s.sqlPortOpen && ns.fileExists('SQLInject.exe', 'home')) {
                    ns.sqlinject(s);
                }
                if (!s.httpPortOpen && ns.fileExists('HTTPWorm.exe', 'home')) {
                    ns.httpworm(s);
                }
                if (!s.smtpPortOpen && ns.fileExists('relaySMTP.exe', 'home')) {
                    ns.relaysmtp(s);
                }
                ns.print("--> Now " + s + " has " + s.openPortCount + " ports opened");
                if (s.openPortCount >= s.numOpenPortsRequired) {
                    ns.print("nuking it...");
                    ns.nuke(s);
                }
            } else {
                ns.print("Nuking server " + s.hostname);
                ns.nuke(s.hostname);
            }
        }
        if (s.hasAdminRights && s.maxRam > 0) {
            const ramPerThread = ns.getScriptRam(script, s.hostname);
            if (ramPerThread === 0) {
                ns.print(`The host ${s.hostname} said that script ${script} does not exist...`)
                continue;
            }
            var availableRam = s.maxRam - s.ramUsed;
            var possibleThreads = Math.floor(availableRam / ramPerThread);
            // scp to server
            await ns.scp([script, 'hack.js', 'grow.js', 'weaken.js'], 'home', s.hostname);

            // Server at max capacity?
            if (possibleThreads <= 0) {
                ns.tprint(`Server ${s.hostname} at max capacity!`);
                continue;
            }
            // Fire the script
            const randomMostProfitable = targets[Math.floor(Math.random() * targets.length)];
            ns.tprint(`Starting script ${script} on server ${s.hostname} with target ${randomMostProfitable}`);
            ns.exec(script, s.hostname, 1, randomMostProfitable);
        }

    }
}

/**
 * @param list {Array<Server>}
 * @param skill {number}
 */
function getSortedListServers(list, skill) {
    list = list.filter((e) => e.requiredHackingSkill <= skill && e.moneyMax > 0);
    list.sort((a, b) => b.moneyMax - a.moneyMax);
    return list;
}

/** @param list {Array<Server>} 
 * @param skill {number}
 * @param number {number}
 * @returns {Array<Server>}
*/
function getMostProfitableTarget(list, skill, number = 1) {
    const most = [];
    let i = 0;
    // init N values for the n most profitable servers (N first okayish values)
    while (most.length < number && i < list.length) {
        if (list[i].requiredHackingSkill <= skill) {
            most[most.length] = list[i];
        }
        i++;
    }
    most.sort((a, b) => a.moneyMax - b.moneyMax);

    for (let l of list) {
        if (l.moneyMax === 0) {
            continue;
        }
        if (l.requiredHackingSkill > skill) {
            continue;
        }
        if (l.moneyMax > most[0].moneyMax) {
            // the least profitable should be replaced
            most.splice(0, 1, l);
            most.sort((a, b) => a.moneyMax - b.moneyMax);
        }
    }
    return most;
}