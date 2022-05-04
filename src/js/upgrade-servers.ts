import {NS} from "Bitburner";

export async function main(ns: NS) {
    let choices: string[] = [];
    let maxRam = ns.getPurchasedServerMaxRam();
    let i = 3;
    let currentRam = 2 ** i;
    while (currentRam <= maxRam) {
        choices[choices.length] = currentRam.toFixed();
        i++;
        currentRam = 2 ** i;
    }
    let targetRamSt: string = <string>await ns.prompt("RAM for newly purchased servers: ",
        {type: "select", choices: choices});

    if (targetRamSt === undefined) {
        ns.tprint("Failed to select RAM");
        return;
    }
    let targetRam = parseInt(targetRamSt);
    let removeBelowSt: string = <string>await ns.prompt("Delete servers below this RAM",
        {type: "select", choices: choices});
    let removeBelow: number;
    if (removeBelowSt === undefined) {
        removeBelow = 0;
    } else {
        removeBelow = parseInt(removeBelowSt);
    }
    let purchasedList = ns.getPurchasedServers();
    for (let s of purchasedList) {
        let purchased = ns.getServer(s);
        if (purchased.maxRam <= removeBelow) {
            ns.killall(s);
            ns.deleteServer(s);
        }
    }
    const costServer = ns.getPurchasedServerCost(targetRam);
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        while (ns.getServerMoneyAvailable('home') < costServer) {
            await ns.sleep(30000);
        }
        ns.purchaseServer(`a-serv-${targetRam}`, targetRam);
    }
}