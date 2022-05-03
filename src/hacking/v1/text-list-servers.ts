import {NS} from "Bitburner";

export class ServerChars {
    name: string;
    skill: number;
    currentMoney: number;
    maxMoney: number;
    security: number;
    minSecurity: number;
    root: boolean;
    ram: number;

    constructor(name: string, skill: number, currentMoney: number, maxMoney: number,
                security: number, minSecurity: number, root: boolean, ram: number) {
        this.name = name;
        this.skill = skill;
        this.currentMoney = currentMoney;
        this.maxMoney = maxMoney;
        this.security = security;
        this.minSecurity = minSecurity;
        this.root = root;
        this.ram = ram;
    }

    format(del = "\t") {
        return `${this.name}${del}${this.skill}` + del + this.currentMoney.toFixed() + del +
            this.maxMoney.toFixed() + del + (this.currentMoney * 100 / this.maxMoney).toFixed(1) +
            " %" + del + this.security.toFixed(2) + del + this.minSecurity.toFixed() + del +
            (this.security / this.minSecurity).toFixed(2) + del + this.root + del + this.ram;
    }
}


/** @param {NS} ns */
export async function main(ns: NS) {
    const list: ServerChars[] = analyzeNetwork(ns);
    const maxHack: number = ns.getHackingLevel();
    list.sort((a, b) => {
        if (a.maxMoney === 0 && b.maxMoney === 0) return a.skill - b.skill;
        if (a.maxMoney === 0) return -1;
        if (b.maxMoney === 0) return 1;
        if (a.skill <= maxHack) {
            return a.maxMoney - b.maxMoney;
        }
        return a.skill - b.skill;
    });
    await ns.write("servers.txt", format(list), "w");
}

/** @param {NS} ns
 * @param root the root node to analyze
 * @param list the collected nodes
 */
function analyzeNetwork(ns: NS, root: string = 'home', list: ServerChars[] = []): ServerChars[] {
    const server = ns.getServer(root);
    ns.getServerSecurityLevel(root);
    list[list.length] =
        new ServerChars(root, server.requiredHackingSkill, server.moneyAvailable, server.moneyMax,
            server.hackDifficulty, ns.getServerMinSecurityLevel(root), server.hasAdminRights,
            server.maxRam);
    const children = ns.scan(root);
    for (const c of children) {
        if (list.findIndex((e) => e.name === c) === -1) {
            analyzeNetwork(ns, c, list)
        }
    }
    return list;
}

function format(list: ServerChars[]) {
    let res = "Name,Skill,Available €,Max €,Money %,Security,Min security,Security %,Admin?,RAM\n";
    for (let l of list) {
        res += l.format(",") + "\n";
    }
    return res;
}