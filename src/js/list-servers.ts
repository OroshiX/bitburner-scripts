import {NS, Server} from "Bitburner";

export async function main(ns: NS) {
    const list = analyzeNetwork(ns);
    const maxHack = ns.getHackingLevel();
    ns.printf("My hacking level is %d", maxHack);
    let toPrint = "";
    // {Server} server
    list.sort((a, b) => {
        let res;
        if (a.moneyMax === 0 && b.moneyMax === 0) {
            res = a.requiredHackingSkill - b.requiredHackingSkill;
        } else if (a.moneyMax === 0) {
            res = -1;
        } else if (b.moneyMax === 0) {
            res = 1;
        } else if (a.requiredHackingSkill <= maxHack && b.requiredHackingSkill <= maxHack) {
            res = a.moneyMax - b.moneyMax;
        } else if (a.requiredHackingSkill <= maxHack) {
            res = -1;
        } else if (b.requiredHackingSkill <= maxHack) {
            res = 1;
        } else {
            res = a.requiredHackingSkill - b.requiredHackingSkill;
        }
        let lower, upper, sign;
        const pad1 = 18, pad2 = 22;
        if (res === 0) {
            lower = a;
            upper = b;
            sign = "=";
        } else {
            sign = "<";
            if (res >= 0) {
                lower = b;
                upper = a;
            } else {
                lower = a;
                upper = b;
            }
        }
        const part1 = lower.hostname.padEnd(pad1) +
            ` (${lower.moneyMax}, ${lower.requiredHackingSkill})`.padEnd(pad2);
        const part2 = upper.hostname.padEnd(pad1) +
            ` (${upper.moneyMax},${upper.requiredHackingSkill})`.padEnd(pad2);
        toPrint += `\n${part1}\t${sign}\t${part2}\t[${res}]`;
        return res;
    });
    //ns.tprint(toPrint);
    await ns.write("/js/all-servers.js", format(list), "w");
}

/** @param {NS} ns
 * @param root the node to  start the analyse from
 * @param {Array<Server>} list
 * @param level the level number
 */
export function analyzeNetwork(ns: NS, root = "home", list: Server[] = [],
                               level = 0): Server[] {
    const server = ns.getServer(root);
    ns.print(">".padEnd(level, "-") + root + ` RAM used: ${server.ramUsed}`);
    list[list.length] = server;
    const children = ns.scan(root);
    for (const c of children) {
        if (list.findIndex((e, i, o) => e.hostname === c) === -1) {
            analyzeNetwork(ns, c, list, level + 1);
        }
    }
    return list;
}

/** @param {Array<Server>} list */
function format(list: Server[]) {
    const json = JSON.stringify(list);
    return `export const allServers=${json};`;
}