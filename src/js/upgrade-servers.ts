import {NS} from "Bitburner";
import {TermLogger} from "/lib/Helpers";

export async function main(ns: NS) {
    const logger = new TermLogger(ns);
    const choices: string[] = [];
    const maxRam = ns.getPurchasedServerMaxRam();
    let i = 3;
    let currentRam = 2 ** i;
    while (currentRam <= maxRam) {
        choices[choices.length] = currentRam.toFixed();
        i++;
        currentRam = 2 ** i;
    }
    const targetRamSt: string = <string>await ns.prompt("RAM for newly purchased servers: ",
        {type: "select", choices: choices});

    if (targetRamSt === undefined) {
        ns.tprint("Failed to select RAM");
        return;
    }
    const targetRam = parseInt(targetRamSt);
    const removeBelowSt: string = <string>await ns.prompt("Delete servers below this RAM",
        {type: "select", choices: choices});
    let removeBelow: number;
    if (removeBelowSt === undefined) {
        removeBelow = 0;
    } else {
        removeBelow = parseInt(removeBelowSt);
    }
    const purchasedList = ns.getPurchasedServers();
    for (const s of purchasedList) {
        const purchased = ns.getServer(s);
        if (purchased.maxRam <= removeBelow) {
            ns.killall(s);
            ns.deleteServer(s);
            logger.info(`Deleted server ${s}`);
        }
    }
    const costServer = ns.getPurchasedServerCost(targetRam);
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        while (ns.getServerMoneyAvailable("home") < costServer) {
            await ns.sleep(30000);
        }
        const purchased = ns.purchaseServer(`a-serv-${targetRam}`, targetRam);
        logger.info(`Bought server ${purchased} with ${targetRam}G RAM`);
    }
}