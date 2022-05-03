/** @param {NS} ns */
import {NS} from "Bitburner";

export async function main(ns: NS) {
    let choices: string[] = [];
    for (let i = 3; i < 32; i++) {
        choices[choices.length] = (2 ** i).toFixed();
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
    const costServer = ns.getPurchasedServerCost(targetRam);
    let purchasedList = ns.getPurchasedServers();
    for (let s of purchasedList) {
        let purchased = ns.getServer(s);
        if (purchased.maxRam <= removeBelow) {
            ns.killall(s);
            ns.deleteServer(s);
            while (ns.getPlayer().money < costServer) {
                await ns.sleep(30000);
            }
            ns.purchaseServer(`a-serv-${targetRam}`, targetRam);
        }
    }
}