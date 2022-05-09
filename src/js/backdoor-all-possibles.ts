import {NS, Server} from "Bitburner";
import {scriptGrow, scriptHack, scriptWeaken} from "/js/script-names";
import {analyzeNetwork} from "/js/list-servers";

/** @param {NS} ns */
export async function main(ns: NS) {
    // var file = await ns.read("servers.txt");
    const list = analyzeNetwork(ns);
    getRootAccess(list, ns);
    let i = 0;
    let next: string = <string>ns.args[i];
    let targets: string[] = [];
    while (i < 10 && next !== undefined) {
        targets[i] = next as string;
        i++;
        next = <string>ns.args[i];
    }
    if (targets.length === 0) {
        let nbTargetsSt: string = <string>await ns.prompt("Choose the number of targets",
            {type: "select", choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]});
        if (nbTargetsSt === undefined) {
            ns.tprint("Cancelling deploy");
            return;
        }
        let nbTargets = parseInt(nbTargetsSt);
        let listServers = getSortedListServers(list, ns.getHackingLevel());
        for (i = 0; i < nbTargets; i++) {
            const chosen = await ns.prompt(`choose the target No: ${i + 1}`,
                {type: "select", choices: listServers.map((e) => e.hostname)});
            targets[i] = chosen as string;
            const index = listServers.findIndex((e) => e.hostname === chosen);
            if (index !== -1) {
                listServers.splice(index, 1);
            }
        }
    }

    const scripts = ns.ls("home", ".js");
    const script: string = <string>await ns.prompt("Choose a script to deploy",
        {type: "select", choices: scripts});
    if (script === undefined) {
        ns.tprint("Please choose a script");
        return;
    }
    ns.tprint(`Next time you can call :\n\trun ${ns.getScriptName()} ${targets.join(" ")}`);
    for (const s of list) {
        ns.print(`server ${s.hostname}`);
        if ((ns.hasRootAccess(s.hostname) || s.purchasedByPlayer) && s.maxRam > 0) {
            ns.print(
                `scp-ing files ${script}, ${scriptHack}, ${scriptGrow} and ${scriptWeaken} from home to ${s.hostname}`);
            // scp to server
            await ns.scp([script, scriptHack, scriptGrow, scriptWeaken], "home", s.hostname);
            const ramPerThread = ns.getScriptRam(script, s.hostname);
            if (ramPerThread === 0) {
                ns.print(`The host ${s.hostname} said that script ${script} does not exist...`);
                continue;
            }
            const availableRam = s.maxRam - s.ramUsed;
            const possibleThreads = Math.floor(availableRam / ramPerThread);

            // Server at max capacity?
            if (possibleThreads <= 0) {
                ns.tprint(`Server ${s.hostname} at max capacity!`);
                continue;
            }
            // Fire the script
            const randomMostProfitable = targets[Math.floor(Math.random() * targets.length)];
            ns.tprint(
                `Starting script ${script} on server ${s.hostname} with target ${randomMostProfitable}`);
            ns.exec(script, s.hostname, 1, randomMostProfitable, s.hostname, scriptGrow, scriptHack,
                scriptWeaken);
        }

    }
}

function getRootAccess(list: Server[], ns: NS) {
    let ftp = programExists("FTPCrack.exe", ns);
    let ssh = programExists("BruteSSH.exe", ns);
    let sql = programExists("SQLInject.exe", ns);
    let http = programExists("HTTPWorm.exe", ns);
    let smtp = programExists("relaySMTP.exe", ns);
    for (let server of list) {
        if (!server.hasAdminRights) {
            if (server.numOpenPortsRequired > server.openPortCount) {
                ns.print(
                    `Opening ports on server ${server.hostname} (${server.openPortCount}/${server.numOpenPortsRequired})`);
                if (!server.ftpPortOpen && ftp) {
                    ns.ftpcrack(server.hostname);
                    server.openPortCount++;
                }
                if (!server.sshPortOpen && ssh) {
                    ns.brutessh(server.hostname);
                    server.openPortCount++;
                }
                if (!server.sqlPortOpen && sql) {
                    ns.sqlinject(server.hostname);
                    server.openPortCount++;
                }
                if (!server.httpPortOpen && http) {
                    ns.httpworm(server.hostname);
                    server.openPortCount++;
                }
                if (!server.smtpPortOpen && smtp) {
                    ns.relaysmtp(server.hostname);
                    server.openPortCount++;
                }
                ns.print(`--> Now ${server.hostname} has ${server.openPortCount} open ports`);
                if (server.openPortCount >= server.numOpenPortsRequired) {
                    ns.print("Now can nuke it...");
                    ns.nuke(server.hostname);
                }
            } else {
                ns.print(`Nuking server ${server.hostname}`);
                ns.nuke(server.hostname);
            }
        }
    }
}

function programExists(name: string, ns: NS): boolean {
    let res = ns.fileExists(name, "home");
    if (!res) {
        ns.print(`Program ${name} does not exist`);
    }
    return res;
}

function getSortedListServers(list: Server[], skill: number) {
    list =
        list.filter((e) => e.requiredHackingSkill <= skill && e.moneyMax > 0 && e.hasAdminRights);
    list.sort((a, b) => b.moneyMax - a.moneyMax);
    return list;
}