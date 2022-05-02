/** @param {NS} ns */
export async function main(ns) {
    const choices = ["8", "16", "32", "64", "128", "256", "512", "1024"];
    let targetRam = await ns.prompt("RAM for newly purchased servers: ", { type: "select", choices: choices });

    if (targetRam === undefined) {
        ns.tprint("Failed to select RAM");
        return;
    }
    let removeBelow = await ns.prompt("Delete servers below this RAM", { type: "select", choices: choices });
    if(removeBelow === undefined) {
        removeBelow = 0;
    } else {
        removeBelow = parseInt(removeBelow);
    }
    targetRam = parseInt(targetRam);
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